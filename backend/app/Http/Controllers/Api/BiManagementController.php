<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Visitor;
use App\Models\TouristSite;
use App\Models\Accommodation;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class BiManagementController extends Controller
{
    /**
     * Executes the python ETL pipeline
     */
    public function executeEtl()
    {
        try {
            $basePath = base_path('../etl'); // Assuming ETL is at the same level as backend
            
            // Path to python executable (specifically for the user's environment)
            $pythonPath = 'C:\Users\Usuario\AppData\Local\Programs\Python\Python311\python.exe';
            
            // Use shell_exec to run the script and capture the output
            // We use 2>&1 to capture stderr as well
            // Force PYTHONIOENCODING to utf-8 to prevent Malformed UTF-8 characters error in json response
            $command = "cd \"$basePath\" && set PYTHONIOENCODING=utf-8 && \"$pythonPath\" run_pipeline.py 2>&1";
            $output = shell_exec($command);
            
            // Clean up any remaining invalid UTF-8 characters to ensure json() doesn't fail
            $cleanOutput = mb_convert_encoding($output, 'UTF-8', 'UTF-8');
            if ($cleanOutput === false || $cleanOutput === '') {
                $cleanOutput = mb_convert_encoding($output, 'UTF-8', 'Windows-1252'); // Fallback for Windows
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Pipeline ejecutado exitosamente.',
                'log' => $cleanOutput
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo al ejecutar el pipeline.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Compares table counts between OLTP (MySQL) and OLAP (SQLite DW)
     */
    public function compareData()
    {
        try {
            $dw = DB::connection('dw_mysql');
            
            // 1. Visitors
            $oltpVisitors = Visitor::count();
            $olapVisitors = $dw->table('fact_visitor_flow')->sum('visit_count') ?? 0;
            
            // 2. Tourist Sites
            $oltpSites = TouristSite::count();
            $olapSites = $dw->table('dim_tourist_site')->count();
            
            // 3. Accommodations
            $oltpAccommodations = Accommodation::count();
            $olapAccommodations = $dw->table('dim_accommodation')->count();
            
            // 4. Daily Occupancy
            $oltpOccupancy = DB::table('daily_occupancy')->count();
            $olapOccupancy = $dw->table('fact_daily_occupancy')->count();

            return response()->json([
                'comparisons' => [
                    [
                        'entity' => 'Visitantes Registrados',
                        'oltp_count' => $oltpVisitors,
                        'olap_count' => $olapVisitors,
                        'deviation' => $olapVisitors - $oltpVisitors,
                        'status' => ($olapVisitors == $oltpVisitors) ? 'synchronized' : 'out_of_sync'
                    ],
                    [
                        'entity' => 'Sitios Turísticos',
                        'oltp_count' => $oltpSites,
                        'olap_count' => $olapSites,
                        'deviation' => $olapSites - $oltpSites,
                        'status' => ($olapSites == $oltpSites) ? 'synchronized' : 'out_of_sync'
                    ],
                    [
                        'entity' => 'Hospedajes',
                        'oltp_count' => $oltpAccommodations,
                        'olap_count' => $olapAccommodations,
                        'deviation' => $olapAccommodations - $oltpAccommodations,
                        'status' => ($olapAccommodations == $oltpAccommodations) ? 'synchronized' : 'out_of_sync'
                    ],
                    [
                        'entity' => 'Registros Ocupación Diaria',
                        'oltp_count' => $oltpOccupancy,
                        'olap_count' => $olapOccupancy,
                        'deviation' => $olapOccupancy - $oltpOccupancy,
                        'status' => ($olapOccupancy == $oltpOccupancy) ? 'synchronized' : 'out_of_sync'
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo conectar al Data Warehouse para comparar.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get table structures for comparison
     */
    public function tableStructures()
    {
        try {
            $dw = DB::connection('dw_mysql');
            $oltpSchema = DB::connection('mysql')->getSchemaBuilder();
            $olapSchema = DB::connection('dw_mysql')->getSchemaBuilder();
            
            $structures = [];
            
            // Mapping of logical entity to OLTP and OLAP tables
            $mappings = [
                'Visitantes' => ['oltp' => 'visitors', 'olap' => 'fact_visitor_flow'],
                'Sitios Turísticos' => ['oltp' => 'tourist_sites', 'olap' => 'dim_tourist_site'],
                'Hospedajes' => ['oltp' => 'accommodations', 'olap' => 'dim_accommodation'],
                'Dimensión Tiempo' => ['oltp' => null, 'olap' => 'dim_time'],
                'Dimensión Geografía' => ['oltp' => null, 'olap' => 'dim_geography']
            ];

            foreach ($mappings as $entity => $tables) {
                $oltpColumns = [];
                if ($tables['oltp'] && $oltpSchema->hasTable($tables['oltp'])) {
                    $oltpColumns = $oltpSchema->getColumnListing($tables['oltp']);
                }

                $olapColumns = [];
                if ($tables['olap'] && $olapSchema->hasTable($tables['olap'])) {
                    $olapColumns = $olapSchema->getColumnListing($tables['olap']);
                }

                $structures[] = [
                    'entity' => $entity,
                    'oltp_table' => $tables['oltp'] ?? 'N/A',
                    'olap_table' => $tables['olap'] ?? 'N/A',
                    'oltp_columns' => $oltpColumns,
                    'olap_columns' => $olapColumns
                ];
            }

            return response()->json(['structures' => $structures]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Query a specific ID in both databases to demonstrate architectural differences
     */
    public function queryById(Request $request)
    {
        $request->validate([
            'entity' => 'required|string',
            'id' => 'required|numeric'
        ]);

        $entity = $request->entity;
        $id = $request->id;

        $oltpData = null;
        $olapData = null;

        try {
            $dw = DB::connection('dw_mysql');

            if ($entity === 'visitors') {
                $oltpData = Visitor::find($id);
                
                // For visitors (facts), the DW does not store individual IDs, it aggregates them.
                // We show the aggregated cube (fact) where this visitor would belong based on their data.
                if ($oltpData) {
                    // Try to find the time_id and geography_id from dimensions
                    $time = $dw->table('dim_time')->where('date', $oltpData->entry_date)->first();
                    
                    if ($time) {
                        $olapData = $dw->table('fact_visitor_flow')
                            ->join('dim_time', 'fact_visitor_flow.time_id', '=', 'dim_time.time_id')
                            ->join('dim_tourist_site', 'fact_visitor_flow.site_id', '=', 'dim_tourist_site.site_id')
                            ->join('dim_geography', 'fact_visitor_flow.geography_id', '=', 'dim_geography.geography_id')
                            ->where('fact_visitor_flow.time_id', $time->time_id)
                            ->where('fact_visitor_flow.site_id', $oltpData->site_id)
                            ->select('dim_time.date', 'dim_tourist_site.name as site', 'dim_geography.country', 'fact_visitor_flow.visit_count as total_personas_en_este_cubo')
                            ->first();
                    }
                    if (!$olapData) {
                        $olapData = ['message' => 'El visitante está en MySQL pero no se encontró su cubo en el DW. ¿Ejecutó la Sincronización ETL?'];
                    }
                } else {
                    $olapData = ['message' => 'No se puede ubicar el cubo en el DW porque el visitante no existe en OLTP.'];
                }

            } elseif ($entity === 'sites') {
                $oltpData = TouristSite::find($id);
                // Sites are stored as dimensions, they keep their site_id
                $olapData = $dw->table('dim_tourist_site')->where('site_id', $id)->first();
                if (!$olapData) {
                    $olapData = ['message' => 'No se encontró la dimensión en el DW.'];
                }
            } elseif ($entity === 'accommodations') {
                $oltpData = Accommodation::find($id);
                // Accommodations are stored as dimensions
                $olapData = $dw->table('dim_accommodation')->where('accommodation_id', $id)->first();
                if (!$olapData) {
                    $olapData = ['message' => 'No se encontró la dimensión en el DW.'];
                }
            }

            return response()->json([
                'success' => true,
                'entity' => $entity,
                'id' => $id,
                'oltp_data' => $oltpData,
                'olap_data' => $olapData
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
