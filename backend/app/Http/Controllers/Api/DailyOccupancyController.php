<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyOccupancy;
use Illuminate\Http\Request;

class DailyOccupancyController extends Controller
{
    public function index()
    {
        return DailyOccupancy::with('accommodation')->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'accommodation_id' => 'required|exists:accommodations,id',
            'date' => 'required|date',
            'occupied_rooms' => 'required|integer|min:0',
            'available_rooms' => 'required|integer|min:0',
            'occupancy_rate' => 'required|numeric|min:0|max:100',
        ]);

        $occupancy = DailyOccupancy::create($validated);
        return response()->json($occupancy, 201);
    }

    public function show(DailyOccupancy $dailyOccupancy)
    {
        return $dailyOccupancy->load('accommodation');
    }

    public function update(Request $request, DailyOccupancy $dailyOccupancy)
    {
        $validated = $request->validate([
            'accommodation_id' => 'sometimes|exists:accommodations,id',
            'date' => 'sometimes|date',
            'occupied_rooms' => 'sometimes|integer|min:0',
            'available_rooms' => 'sometimes|integer|min:0',
            'occupancy_rate' => 'sometimes|numeric|min:0|max:100',
        ]);

        $dailyOccupancy->update($validated);
        return response()->json($dailyOccupancy);
    }

    public function destroy(DailyOccupancy $dailyOccupancy)
    {
        $dailyOccupancy->delete();
        return response()->json(null, 204);
    }
}
