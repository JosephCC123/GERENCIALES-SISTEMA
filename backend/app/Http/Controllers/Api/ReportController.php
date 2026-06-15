<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Extrae datos filtrados del Data Warehouse para exportar
     */
    public function getAdvancedReportData(Request $request)
    {
        $dw = DB::connection('dw_mysql');
        $type = $request->input('type', 'general');

        if ($type === 'general') {
            $query = $dw->table('fact_visitor_flow')
                ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
                ->join('dim_tourist_site', 'fact_visitor_flow.site_id', '=', 'dim_tourist_site.site_id')
                ->join('dim_demographics', 'fact_visitor_flow.demographic_id', '=', 'dim_demographics.demographic_id')
                ->join('dim_geography', 'fact_visitor_flow.geography_id', '=', 'dim_geography.geography_id')
                ->select(
                    'dim_time.date',
                    'dim_tourist_site.name as site_name',
                    'dim_geography.country as nationality',
                    'dim_demographics.age_group',
                    'dim_demographics.purpose_of_visit',
                    'fact_visitor_flow.visit_count',
                    'fact_visitor_flow.duration_days'
                );

            if ($request->has('start_date') && $request->has('end_date')) {
                $start = $request->start_date;
                $end = $request->end_date;
                if ($start > $end) {
                    $tmp = $start;
                    $start = $end;
                    $end = $tmp;
                }
                $query->whereBetween('dim_time.date', [$start, $end]);
            }
            if ($request->has('site_id') && $request->site_id != 'all') {
                $query->where('dim_tourist_site.site_id', $request->site_id);
            }
            if ($request->has('nationality') && $request->nationality != 'all') {
                $query->where('dim_geography.country', $request->nationality);
            }

            $data = $query->orderBy('dim_time.date', 'desc')->limit(10000)->get();

            return response()->json(['success' => true, 'type' => 'general', 'data' => $data]);
        } 
        
        else if ($type === 'occupancy') {
            $query = $dw->table('fact_daily_occupancy')
                ->join('dim_time', 'fact_daily_occupancy.time_id', '=', 'dim_time.time_id')
                ->join('dim_accommodation', 'fact_daily_occupancy.accommodation_id', '=', 'dim_accommodation.accommodation_id')
                ->select(
                    'dim_time.date',
                    'dim_accommodation.name as accommodation_name',
                    'dim_accommodation.type',
                    'dim_accommodation.category',
                    'fact_daily_occupancy.total_rooms',
                    'fact_daily_occupancy.occupied_rooms',
                    'fact_daily_occupancy.occupancy_rate',
                    'fact_daily_occupancy.avg_rate'
                );

            if ($request->has('start_date') && $request->has('end_date')) {
                $start = $request->start_date;
                $end = $request->end_date;
                if ($start > $end) {
                    $tmp = $start;
                    $start = $end;
                    $end = $tmp;
                }
                $query->whereBetween('dim_time.date', [$start, $end]);
            }
            if ($request->has('accommodation_type') && $request->accommodation_type != 'all') {
                $query->where('dim_accommodation.type', $request->accommodation_type);
            }

            $data = $query->orderBy('dim_time.date', 'desc')->limit(10000)->get();

            return response()->json(['success' => true, 'type' => 'occupancy', 'data' => $data]);
        }

        else if ($type === 'capacity') {
            $query = $dw->table('fact_visitor_flow')
                ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
                ->join('dim_tourist_site', 'fact_visitor_flow.site_id', '=', 'dim_tourist_site.site_id')
                ->select(
                    'dim_time.date',
                    'dim_tourist_site.name as site_name',
                    'dim_tourist_site.capacity as daily_capacity'
                )
                ->selectRaw("SUM(fact_visitor_flow.visit_count) as total_visitors")
                ->selectRaw("ROUND((SUM(fact_visitor_flow.visit_count) / dim_tourist_site.capacity) * 100, 2) as saturation_percentage")
                ->groupBy('dim_time.date', 'dim_tourist_site.name', 'dim_tourist_site.capacity');

            if ($request->has('start_date') && $request->has('end_date')) {
                $start = $request->start_date;
                $end = $request->end_date;
                if ($start > $end) {
                    $tmp = $start;
                    $start = $end;
                    $end = $tmp;
                }
                $query->whereBetween('dim_time.date', [$start, $end]);
            }
            if ($request->has('site_id') && $request->site_id != 'all') {
                $query->where('dim_tourist_site.site_id', $request->site_id);
            }

            $data = $query->orderBy('dim_time.date', 'desc')->limit(10000)->get();

            return response()->json(['success' => true, 'type' => 'capacity', 'data' => $data]);
        }

        else if ($type === 'operational') {
            // This queries the OLTP system (default database)
            $oltp = DB::connection('mysql'); // The default config
            
            $subType = $request->input('operational_subtype', 'operators'); // operators or guides

            if ($subType === 'operators') {
                $data = $oltp->table('tourism_operators')
                    ->select('company_name', 'license_number', 'license_expiry', 'status', 'created_at')
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                $data = $oltp->table('certified_guides')
                    ->select('full_name', 'license_number', 'languages', 'status', 'created_at')
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            return response()->json(['success' => true, 'type' => 'operational', 'subtype' => $subType, 'data' => $data]);
        }

        return response()->json(['success' => false, 'message' => 'Invalid report type'], 400);
    }

    /**
     * Extrae todos los KPIs consolidados y tendencias del Data Warehouse
     */
    public function getDwKpiData()
    {
        try {
            $dw = DB::connection('dw_mysql');

            $totalVisitors = $dw->table('fact_visitor_flow')->sum('visit_count') ?? 0;
            $avgDuration = $dw->table('fact_visitor_flow')->avg('duration_days') ?? 0;
            $avgOccupancyRate = $dw->table('fact_daily_occupancy')->avg('occupancy_rate') ?? 0;

            $topSiteRow = $dw->table('fact_visitor_flow')
                ->join('dim_tourist_site', 'fact_visitor_flow.site_id', '=', 'dim_tourist_site.site_id')
                ->select('dim_tourist_site.name', DB::raw('SUM(visit_count) as total'))
                ->groupBy('dim_tourist_site.name')
                ->orderBy('total', 'desc')
                ->first();

            $topCountryRow = $dw->table('fact_visitor_flow')
                ->join('dim_geography', 'fact_visitor_flow.geography_id', '=', 'dim_geography.geography_id')
                ->select('dim_geography.country', DB::raw('SUM(visit_count) as total'))
                ->groupBy('dim_geography.country')
                ->orderBy('total', 'desc')
                ->first();

            $topPurposeRow = $dw->table('fact_visitor_flow')
                ->join('dim_demographics', 'fact_visitor_flow.demographic_id', '=', 'dim_demographics.demographic_id')
                ->select('dim_demographics.purpose_of_visit', DB::raw('SUM(visit_count) as total'))
                ->groupBy('dim_demographics.purpose_of_visit')
                ->orderBy('total', 'desc')
                ->first();

            $topAgeGroupRow = $dw->table('fact_visitor_flow')
                ->join('dim_demographics', 'fact_visitor_flow.demographic_id', '=', 'dim_demographics.demographic_id')
                ->select('dim_demographics.age_group', DB::raw('SUM(visit_count) as total'))
                ->groupBy('dim_demographics.age_group')
                ->orderBy('total', 'desc')
                ->first();

            $topAccommodationTypeRow = $dw->table('fact_daily_occupancy')
                ->join('dim_accommodation', 'fact_daily_occupancy.accommodation_id', '=', 'dim_accommodation.accommodation_id')
                ->select('dim_accommodation.type', DB::raw('AVG(occupancy_rate) as avg_rate'))
                ->groupBy('dim_accommodation.type')
                ->orderBy('avg_rate', 'desc')
                ->first();

            $totalAccommodations = $dw->table('dim_accommodation')->count();
            $totalSites = $dw->table('dim_tourist_site')->count();
            $totalCapacity = $dw->table('dim_tourist_site')->sum('capacity') ?? 0;
            $totalRooms = $dw->table('dim_accommodation')->sum('total_rooms') ?? 0;

            // Historical chart: Monthly visitors trend
            $monthlyTrend = $dw->table('fact_visitor_flow')
                ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
                ->select('dim_time.year', 'dim_time.month', DB::raw('SUM(visit_count) as total'))
                ->groupBy('dim_time.year', 'dim_time.month')
                ->orderBy('dim_time.year', 'asc')
                ->orderBy('dim_time.month', 'asc')
                ->limit(24)
                ->get()
                ->map(function($item) {
                    return [
                        'period' => date("M", mktime(0, 0, 0, $item->month, 10)) . ' ' . $item->year,
                        'total' => (int)$item->total
                    ];
                });

            // Historical chart: Monthly occupancy trend
            $occupancyTrend = $dw->table('fact_daily_occupancy')
                ->join('dim_time', 'fact_daily_occupancy.time_id', '=', 'dim_time.time_id')
                ->select('dim_time.year', 'dim_time.month', DB::raw('AVG(occupancy_rate) as rate'))
                ->groupBy('dim_time.year', 'dim_time.month')
                ->orderBy('dim_time.year', 'asc')
                ->orderBy('dim_time.month', 'asc')
                ->limit(24)
                ->get()
                ->map(function($item) {
                    return [
                        'period' => date("M", mktime(0, 0, 0, $item->month, 10)) . ' ' . $item->year,
                        'rate' => round((float)$item->rate, 1)
                    ];
                });

            return response()->json([
                'success' => true,
                'kpis' => [
                    'total_visitors' => (int)$totalVisitors,
                    'avg_duration' => round((float)$avgDuration, 1),
                    'avg_occupancy_rate' => round((float)$avgOccupancyRate, 1),
                    'top_site' => $topSiteRow ? $topSiteRow->name : 'Ninguno',
                    'top_site_visitors' => $topSiteRow ? (int)$topSiteRow->total : 0,
                    'top_country' => $topCountryRow ? $topCountryRow->country : 'Ninguno',
                    'top_country_visitors' => $topCountryRow ? (int)$topCountryRow->total : 0,
                    'top_purpose' => $topPurposeRow ? $topPurposeRow->purpose_of_visit : 'Ninguno',
                    'top_purpose_visitors' => $topPurposeRow ? (int)$topPurposeRow->total : 0,
                    'top_age_group' => $topAgeGroupRow ? $topAgeGroupRow->age_group : 'Ninguno',
                    'top_age_group_visitors' => $topAgeGroupRow ? (int)$topAgeGroupRow->total : 0,
                    'top_accommodation_type' => $topAccommodationTypeRow ? $topAccommodationTypeRow->type : 'Ninguno',
                    'top_accommodation_rate' => $topAccommodationTypeRow ? round((float)$topAccommodationTypeRow->avg_rate, 1) : 0,
                    'total_accommodations' => $totalAccommodations,
                    'total_sites' => $totalSites,
                    'total_capacity' => (int)$totalCapacity,
                    'total_rooms' => (int)$totalRooms,
                ],
                'charts' => [
                    'monthly_trend' => $monthlyTrend,
                    'occupancy_trend' => $occupancyTrend
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener KPIs del Data Warehouse',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
