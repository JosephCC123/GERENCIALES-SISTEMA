<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;

class AccommodationController extends Controller
{
    public function index()
    {
        return Accommodation::with('operator')->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'operator_id' => 'required|exists:tourism_operators,id',
            'name' => 'required|string|max:255',
            'category' => 'required|integer|min:1|max:5',
            'total_rooms' => 'required|integer|min:1',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $accommodation = Accommodation::create($validated);
        return response()->json($accommodation, 201);
    }

    public function show(Accommodation $accommodation)
    {
        return $accommodation->load('operator', 'dailyOccupancies');
    }

    public function update(Request $request, Accommodation $accommodation)
    {
        $validated = $request->validate([
            'operator_id' => 'sometimes|exists:tourism_operators,id',
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|integer|min:1|max:5',
            'total_rooms' => 'sometimes|integer|min:1',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $accommodation->update($validated);
        return response()->json($accommodation);
    }

    public function destroy(Accommodation $accommodation)
    {
        $accommodation->delete();
        return response()->json(null, 204);
    }
}
