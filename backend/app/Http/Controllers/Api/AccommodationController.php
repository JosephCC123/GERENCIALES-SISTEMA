<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;

class AccommodationController extends Controller
{
    public function index(Request $request)
    {
        $query = Accommodation::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        return $query->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'operator_id' => 'nullable|exists:tourism_operators,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'total_rooms' => 'required|integer|min:1',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'status' => 'required|string|max:255',
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
            'operator_id' => 'nullable|exists:tourism_operators,id',
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:255',
            'total_rooms' => 'sometimes|integer|min:1',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'status' => 'sometimes|string|max:255',
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
