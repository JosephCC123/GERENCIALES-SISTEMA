<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TourismOperator;
use Illuminate\Http\Request;

class TourismOperatorController extends Controller
{
    public function index()
    {
        return TourismOperator::paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'ruc' => 'required|string|size:11|unique:tourism_operators',
            'operator_type' => 'required|in:agencia,hotel,transporte',
            'license_number' => 'required|string|max:255',
            'license_expiry' => 'required|date',
            'status' => 'required|in:Activo,Pendiente,Vencido,Suspendido',
        ]);

        $operator = TourismOperator::create($validated);
        return response()->json($operator, 201);
    }

    public function show(TourismOperator $operator)
    {
        return $operator->load('accommodations');
    }

    public function update(Request $request, TourismOperator $operator)
    {
        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'ruc' => 'sometimes|string|size:11|unique:tourism_operators,ruc,'.$operator->id,
            'operator_type' => 'sometimes|in:agencia,hotel,transporte',
            'license_number' => 'sometimes|string|max:255',
            'license_expiry' => 'sometimes|date',
            'status' => 'sometimes|in:Activo,Pendiente,Vencido,Suspendido',
        ]);

        $operator->update($validated);
        return response()->json($operator);
    }

    public function destroy(TourismOperator $operator)
    {
        $operator->delete();
        return response()->json(null, 204);
    }
}
