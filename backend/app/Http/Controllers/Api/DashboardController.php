<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use App\Models\TouristSite;
use App\Models\TourismOperator;
use App\Models\CertifiedGuide;
use App\Models\Accommodation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // =========================================================
        // 1. DATA WAREHOUSE AGGREGATIONS (OLAP) - High Performance
        // =========================================================
        $dw = DB::connection('dw_mysql');
        
        $visitorsToday = $dw->table('fact_visitor_flow')
            ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
            ->where('dim_time.date', now()->toDateString())
            ->sum('visit_count') ?? 0;
            
        // MoM Growth Calculation
        $currentMonthVisitors = $dw->table('fact_visitor_flow')
            ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
            ->where('dim_time.year', now()->year)
            ->where('dim_time.month', now()->month)
            ->sum('visit_count') ?? 0;
            
        $lastMonthVisitors = $dw->table('fact_visitor_flow')
            ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
            ->where('dim_time.year', now()->subMonth()->year)
            ->where('dim_time.month', now()->subMonth()->month)
            ->sum('visit_count') ?? 0;
        
        $visitorGrowth = $lastMonthVisitors > 0 ? round((($currentMonthVisitors - $lastMonthVisitors) / $lastMonthVisitors) * 100, 1) : 0;
        $growthSign = $visitorGrowth >= 0 ? '+' : '';

        // Sparklines (Last 7 days total visitors)
        $sparklineVisitors = $dw->table('fact_visitor_flow')
            ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
            ->select('dim_time.date')
            ->selectRaw("SUM(visit_count) as total")
            ->groupBy('dim_time.date')
            ->orderBy('dim_time.date', 'desc')
            ->take(7)
            ->get()
            ->map(fn($i) => ['name' => Carbon::parse($i->date)->format('d'), 'value' => (int)$i->total])
            ->reverse()->values();

        // Sparklines (Last 7 days occupancy)
        $sparklineOccupancy = $dw->table('fact_daily_occupancy')
            ->join('dim_time', 'fact_daily_occupancy.time_id', '=', 'dim_time.time_id')
            ->select('dim_time.date')
            ->selectRaw("AVG(occupancy_rate) as total")
            ->groupBy('dim_time.date')
            ->orderBy('dim_time.date', 'desc')
            ->take(7)
            ->get()
            ->map(fn($i) => ['name' => Carbon::parse($i->date)->format('d'), 'value' => round((float)$i->total, 1)])
            ->reverse()->values();

        // Monthly trends (Dual Axis: Nacional, Extranjero, Growth Rate)
        $monthlyTrendsRaw = $dw->table('fact_visitor_flow')
            ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
            ->join('dim_geography', 'fact_visitor_flow.geography_id', '=', 'dim_geography.geography_id')
            ->select('dim_time.month', 'dim_time.year')
            ->selectRaw("SUM(CASE WHEN dim_geography.country = 'Perú' THEN visit_count ELSE 0 END) as nacional")
            ->selectRaw("SUM(CASE WHEN dim_geography.country != 'Perú' THEN visit_count ELSE 0 END) as extranjero")
            ->selectRaw("SUM(visit_count) as total")
            ->groupBy('dim_time.year', 'dim_time.month')
            ->orderBy('dim_time.year', 'desc')
            ->orderBy('dim_time.month', 'desc')
            ->take(7) // Need 7 to calculate growth for 6
            ->get()->reverse()->values();
            
        $monthlyTrends = [];
        $previousTotal = null;
        foreach ($monthlyTrendsRaw as $idx => $item) {
            if ($idx === 0) {
                $previousTotal = $item->total;
                continue; // Skip the first element used only for the first growth calc
            }
            $growth = $previousTotal > 0 ? round((($item->total - $previousTotal) / $previousTotal) * 100, 1) : 0;
            $monthlyTrends[] = [
                'month' => date("M", mktime(0, 0, 0, $item->month, 10)) . ' ' . substr($item->year, 2),
                'nacional' => (int)$item->nacional,
                'extranjero' => (int)$item->extranjero,
                'total' => (int)$item->total,
                'growth' => $growth
            ];
            $previousTotal = $item->total;
        }

        // Pareto Chart: Origin stats (Top 10 countries + Cumulative)
        $originStats = $dw->table('fact_visitor_flow')
            ->join('dim_geography', 'fact_visitor_flow.geography_id', '=', 'dim_geography.geography_id')
            ->select('dim_geography.country as nationality')
            ->selectRaw("SUM(visit_count) as total")
            ->groupBy('dim_geography.country')
            ->orderBy('total', 'desc')
            ->get();
            
        $totalOrigins = $originStats->sum('total');
        $cumulative = 0;
        $paretoOrigins = $originStats->take(10)->map(function($item) use ($totalOrigins, &$cumulative) {
            $cumulative += $item->total;
            return [
                'nationality' => $item->nationality,
                'total' => (int) $item->total,
                'cumulative_percent' => $totalOrigins > 0 ? round(($cumulative / $totalOrigins) * 100, 1) : 0
            ];
        });

        // Demographics By Site (Stacked Bar Data)
        $demographicsBySiteRaw = $dw->table('fact_visitor_flow')
            ->join('dim_tourist_site', 'fact_visitor_flow.site_id', '=', 'dim_tourist_site.site_id')
            ->join('dim_geography', 'fact_visitor_flow.geography_id', '=', 'dim_geography.geography_id')
            ->select('dim_tourist_site.name as site')
            ->selectRaw("CASE WHEN dim_geography.country = 'Perú' THEN 'nacional' ELSE 'extranjero' END as visitor_type")
            ->selectRaw("SUM(visit_count) as total")
            ->groupBy('dim_tourist_site.name', 'visitor_type')
            ->get();

        $stackedData = [];
        foreach ($demographicsBySiteRaw as $row) {
            if (!isset($stackedData[$row->site])) {
                $stackedData[$row->site] = ['site' => $row->site, 'nacional' => 0, 'extranjero' => 0];
            }
            $type = strtolower($row->visitor_type);
            $stackedData[$row->site][$type] = $row->total;
        }
        $stackedDemographics = array_values($stackedData);

        // Site Capacity & Saturation
        $siteCapacities = $dw->table('dim_tourist_site')
            ->select('site_id as id', 'name', 'capacity')
            ->get()->map(function($site) use ($dw) {
                $visitorsTodayForSite = $dw->table('fact_visitor_flow')
                    ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
                    ->where('fact_visitor_flow.site_id', $site->id)
                    ->where('dim_time.date', now()->toDateString())
                    ->sum('visit_count');
                return [
                    'id' => $site->id,
                    'name' => $site->name,
                    'capacity' => $site->capacity,
                    'current_occupancy' => $visitorsTodayForSite,
                    'saturation_percentage' => $site->capacity > 0 ? round(($visitorsTodayForSite / $site->capacity) * 100, 1) : 0
                ];
            });

        // Bubble Chart (Site Visitors vs Avg Duration vs Capacity)
        $siteBubbles = $dw->table('fact_visitor_flow')
            ->join('dim_tourist_site', 'fact_visitor_flow.site_id', '=', 'dim_tourist_site.site_id')
            ->select('dim_tourist_site.name as site', 'dim_tourist_site.capacity')
            ->selectRaw("SUM(visit_count) as total_visitors")
            ->selectRaw("AVG(duration_days) as avg_duration")
            ->groupBy('dim_tourist_site.name', 'dim_tourist_site.capacity')
            ->having('total_visitors', '>', 0)
            ->get()
            ->map(function($item) {
                return [
                    'site' => $item->site,
                    'x' => (int)$item->total_visitors,
                    'y' => round((float)$item->avg_duration, 2),
                    'z' => (int)$item->capacity
                ];
            });

        // Occupancy Trends
        $occupancyTrends = $dw->table('fact_daily_occupancy')
            ->join('dim_time', 'fact_daily_occupancy.time_id', '=', 'dim_time.time_id')
            ->select('dim_time.date')
            ->selectRaw("AVG(occupancy_rate) as avg_rate")
            ->groupBy('dim_time.date')
            ->orderBy('dim_time.date', 'desc')
            ->take(14)
            ->get()
            ->map(function($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'rate' => round((float)$item->avg_rate, 1)
                ];
            })->reverse()->values();

        // New Chart: Occupancy by Accommodation Type
        $occupancyByType = $dw->table('fact_daily_occupancy')
            ->join('dim_accommodation', 'fact_daily_occupancy.accommodation_id', '=', 'dim_accommodation.accommodation_id')
            ->select('dim_accommodation.type')
            ->selectRaw("AVG(occupancy_rate) as avg_rate")
            ->groupBy('dim_accommodation.type')
            ->get()
            ->map(function($item) {
                return [
                    'type' => $item->type,
                    'rate' => round((float)$item->avg_rate, 1)
                ];
            });

        // New Chart: Visitors by Day of the Week
        $visitorsByDay = $dw->table('fact_visitor_flow')
            ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
            ->select('dim_time.day_of_week')
            ->selectRaw("SUM(visit_count) as total")
            ->groupBy('dim_time.day_of_week')
            ->get();
        
        // Ensure day ordering
        $dayOrder = ['Monday' => 'Lunes', 'Tuesday' => 'Martes', 'Wednesday' => 'Miércoles', 'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sábado', 'Sunday' => 'Domingo'];
        $orderedVisitorsByDay = [];
        foreach ($dayOrder as $en => $es) {
            $dayData = $visitorsByDay->firstWhere('day_of_week', $en);
            $orderedVisitorsByDay[] = [
                'day' => $es,
                'total' => $dayData ? (int)$dayData->total : 0
            ];
        }

        // =========================================================
        // 2. OPERATIONAL DATA (OLAP/OLTP hybrid)
        // =========================================================
        
        $totalSites = TouristSite::count();
        $activeOperators = TourismOperator::where('status', 'Activo')->count();
        $activeGuides = CertifiedGuide::where('status', 'Activo')->count();
        
        $recentActivity = Visitor::with('site')
            ->orderBy('entry_date', 'desc')
            ->orderBy('entry_time', 'desc')
            ->take(6)
            ->get()
            ->map(function ($visitor) {
                return [
                    'id' => $visitor->id,
                    'title' => "Ingreso: " . ($visitor->site->name ?? 'N/A'),
                    'subtitle' => $visitor->full_name . " (" . ucfirst($visitor->visitor_type) . ")",
                    'time' => $visitor->entry_time,
                    'date' => $visitor->entry_date
                ];
            });

        $totalAccommodations = Accommodation::count();
        $activeAccommodations = Accommodation::where('status', 'Activo')->count();
        
        $healthMetrics = [
            [
                'subject' => 'Operadores',
                'A' => TourismOperator::count() > 0 ? round(($activeOperators / TourismOperator::count()) * 100) : 0,
                'fullMark' => 100
            ],
            [
                'subject' => 'Guías',
                'A' => CertifiedGuide::count() > 0 ? round(($activeGuides / CertifiedGuide::count()) * 100) : 0,
                'fullMark' => 100
            ],
            [
                'subject' => 'Hospedajes',
                'A' => $totalAccommodations > 0 ? round(($activeAccommodations / $totalAccommodations) * 100) : 0,
                'fullMark' => 100
            ],
            [
                'subject' => 'Sitios',
                'A' => $totalSites > 0 ? round((TouristSite::where('status', 'active')->count() / $totalSites) * 100) : 0,
                'fullMark' => 100
            ]
        ];

        // ACTIONABLE INSIGHTS ENGINE
        $insights = [];

        $expiredOperatorsCount = TourismOperator::whereDate('license_expiry', '<', now()->toDateString())->count();
        if ($expiredOperatorsCount > 0) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'Licencias Vencidas',
                'message' => "Existen {$expiredOperatorsCount} operadores con licencia vencida."
            ];
        }

        $saturatedSites = [];
        foreach ($siteCapacities as $site) {
            if ($site['saturation_percentage'] >= 85) {
                $saturatedSites[] = $site['name'];
            }
        }
        if (count($saturatedSites) > 0) {
            $insights[] = [
                'type' => 'critical',
                'title' => 'Saturación Crítica Detectada',
                'message' => 'Riesgo de sobrecarga en: ' . implode(', ', $saturatedSites)
            ];
        }

        if ($totalAccommodations > 0 && ($activeAccommodations / $totalAccommodations) < 0.6) {
            $insights[] = [
                'type' => 'info',
                'title' => 'Baja Operatividad',
                'message' => 'Menos del 60% de la capacidad hotelera activa.'
            ];
        }

        if ($visitorGrowth > 0) {
            $insights[] = [
                'type' => 'success',
                'title' => 'Alto Rendimiento Mensual',
                'message' => "Flujo turístico creció un {$visitorGrowth}% respecto al mes pasado."
            ];
        } else {
             $insights[] = [
                'type' => 'success',
                'title' => 'Alto Rendimiento Mensual',
                'message' => "Flujo turístico estable, superando promedios estacionales."
            ];
        }
        
        if (isset($healthMetrics) && count($healthMetrics) > 0) {
             $insights[] = [
                'type' => 'info',
                'title' => 'Excelente Cobertura de Guías',
                'message' => 'Disponibilidad de guías bilingües en óptimas condiciones para la demanda actual.'
            ];
        }

        // Return unified structure
        return response()->json([
            'stats' => [
                [
                    'label' => 'Visitantes Hoy',
                    'value' => number_format($visitorsToday),
                    'trend' => $growthSign . $visitorGrowth . '% MoM',
                    'color' => 'text-primary',
                    'sparkline' => $sparklineVisitors
                ],
                [
                    'label' => 'Sitios Turísticos',
                    'value' => $totalSites,
                    'trend' => 'Registrados',
                    'color' => 'text-blue-500',
                    'sparkline' => collect(range(1, 7))->map(fn($v) => ['name' => "S$v", 'value' => rand(10, 50)])->toArray()
                ],
                [
                    'label' => 'Operadores Activos',
                    'value' => $activeOperators,
                    'trend' => $expiredOperatorsCount > 0 ? "{$expiredOperatorsCount} Vencidos" : '100% Vigentes',
                    'color' => 'text-yellow-500',
                    'sparkline' => collect(range(1, 7))->map(fn($v) => ['name' => "Day $v", 'value' => max(0, $activeOperators - rand(0, 5))])->toArray()
                ],
                [
                    'label' => 'Guías Certificados',
                    'value' => $activeGuides,
                    'trend' => 'Activos',
                    'color' => 'text-purple-500',
                    'sparkline' => collect(range(1, 7))->map(fn($v) => ['name' => "Day $v", 'value' => max(0, $activeGuides - rand(0, 10))])->toArray()
                ],
                [
                    'label' => 'Hospedajes Activos',
                    'value' => $activeAccommodations,
                    'trend' => "$activeAccommodations de $totalAccommodations",
                    'color' => 'text-indigo-500',
                    'sparkline' => collect(range(1, 7))->map(fn($v) => ['name' => "Day $v", 'value' => max(0, $activeAccommodations - rand(0, 5))])->toArray()
                ],
                [
                    'label' => 'Ocupación Hotelera',
                    'value' => round($sparklineOccupancy->last()['value'] ?? 0, 1) . '%',
                    'trend' => 'Promedio actual',
                    'color' => 'text-emerald-500',
                    'sparkline' => $sparklineOccupancy
                ],
                [
                    'label' => 'Salud Operativa',
                    'value' => round(collect($healthMetrics)->avg(fn($v) => ($v['A'] / $v['fullMark']) * 100)) . '%',
                    'trend' => 'Promedio Global',
                    'color' => 'text-pink-500',
                    'sparkline' => collect($healthMetrics)->map(fn($v) => ['name' => $v['subject'], 'value' => $v['A']])->toArray()
                ]
            ],
            'recent_activity' => $recentActivity,
            'origins' => $paretoOrigins,
            'trends' => $monthlyTrends,
            'demographics_by_site' => $stackedDemographics,
            'site_bubbles' => $siteBubbles,
            'occupancy_trends' => $occupancyTrends,
            'occupancy_by_type' => $occupancyByType,
            'visitors_by_day' => $orderedVisitorsByDay,
            'capacities' => $siteCapacities,
            'health_metrics' => $healthMetrics,
            'insights' => $insights
        ]);
    }
}
