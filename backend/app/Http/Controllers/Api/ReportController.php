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
                ->select(
                    'dim_time.date',
                    'dim_tourist_site.name as site_name',
                    'dim_demographics.nationality',
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
                $query->where('dim_demographics.nationality', $request->nationality);
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
}
