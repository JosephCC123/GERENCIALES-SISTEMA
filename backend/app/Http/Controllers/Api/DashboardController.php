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

        return response()->json([
            'stats' => [
                [
                    'label' => 'Visitantes Hoy',
                    'value' => number_format($visitorsToday),
                    'trend' => '+5%', // Simulating trend for UI
                    'color' => 'text-primary'
                ],
                [
                    'label' => 'Sitios Turísticos',
                    'value' => $totalSites,
                    'trend' => 'Normal',
                    'color' => 'text-secondary'
                ],
                [
                    'label' => 'Operadores Activos',
                    'value' => $activeOperators,
                    'trend' => 'Atención',
                    'color' => 'text-accent'
                ],
                [
                    'label' => 'Guías Certificados',
                    'value' => $activeGuides,
                    'trend' => 'OK',
                    'color' => 'text-green-500'
                ]
            ],
            'recent_activity' => $recentActivity,
            'distribution' => $distribution
        ]);
    }
}
