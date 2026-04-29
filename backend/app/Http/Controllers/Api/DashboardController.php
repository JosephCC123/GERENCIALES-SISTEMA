<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use App\Models\TouristSite;
use App\Models\TourismOperator;
use App\Models\CertifiedGuide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $visitorsToday = Visitor::whereDate('entry_date', now()->toDateString())->count();
        $totalSites = TouristSite::count();
        $activeOperators = TourismOperator::where('status', 'Activo')->count();
        $activeGuides = CertifiedGuide::where('status', 'Activo')->count();
        
        // Recent activity (latest 5 visitors)
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

        // Visitor distribution (National vs Foreign)
        $distribution = Visitor::select('visitor_type', DB::raw('count(*) as total'))
            ->groupBy('visitor_type')
            ->get();

        // Monthly trends (Last 6 months)
        $monthlyTrends = Visitor::select(
            DB::raw('DATE_FORMAT(entry_date, "%b") as month'),
            DB::raw('count(*) as total')
        )
        ->groupBy('month')
        ->orderBy(DB::raw('MIN(entry_date)'), 'asc')
        ->take(6)
        ->get();

        // Origin stats (Top 5 countries)
        $originStats = Visitor::select('nationality', DB::raw('count(*) as total'))
            ->groupBy('nationality')
            ->orderBy('total', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                [
                    'label' => 'Visitantes Hoy',
                    'value' => number_format($visitorsToday),
                    'trend' => '+12.5%',
                    'color' => 'text-primary'
                ],
                [
                    'label' => 'Sitios Turísticos',
                    'value' => $totalSites,
                    'trend' => 'Operativo',
                    'color' => 'text-secondary'
                ],
                [
                    'label' => 'Operadores Activos',
                    'value' => $activeOperators,
                    'trend' => 'Certificado',
                    'color' => 'text-accent'
                ],
                [
                    'label' => 'Guías Certificados',
                    'value' => $activeGuides,
                    'trend' => 'DIRCETUR',
                    'color' => 'text-green-500'
                ]
            ],
            'recent_activity' => $recentActivity,
            'distribution' => $distribution,
            'trends' => $monthlyTrends,
            'origins' => $originStats
        ]);
    }
}
