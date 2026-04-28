<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteCapacityLog;
use Illuminate\Http\Request;

class SiteCapacityLogController extends Controller
{
    public function index() { return SiteCapacityLog::with('site')->paginate(15); }

    public function store(Request $request)
    {
        $v = $request->validate([
            'site_id' => 'required|exists:tourist_sites,id',
            'visitor_count' => 'required|integer',
        ]);
        return response()->json(SiteCapacityLog::create($v), 201);
    }

    public function show(SiteCapacityLog $log) { return $log->load('site'); }

    public function destroy(SiteCapacityLog $log)
    {
        $log->delete();
        return response()->json(null, 204);
    }
}
