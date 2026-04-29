<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    public function index()
    {
        return Visitor::with('site')->paginate(15);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:tourist_sites,id',
            'full_name' => 'required|string|max:255',
            'document_number' => 'required|string|max:20',
            'visitor_type' => 'required|in:nacional,extranjero',
            'nationality' => 'required|string|max:255',
            'entry_date' => 'required|date',
            'entry_time' => 'required',
            'ticket_number' => 'nullable|string|max:50',
        ]);

        $visitor = Visitor::create($validated);
        return response()->json($visitor, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
