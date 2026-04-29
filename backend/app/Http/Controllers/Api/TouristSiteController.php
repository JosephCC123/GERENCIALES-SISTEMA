<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\TouristSite;

class TouristSiteController extends Controller
{
    public function index()
    {
        $sites = TouristSite::with('managingEntity')->paginate(15);
        $sites->getCollection()->transform(function ($site) {
            return [
                'id' => $site->id,
                'name' => $site->name,
                'category' => $site->type,
                'location' => $site->location,
                'capacity_standard' => $site->capacity,
                'admin_entity' => $site->managingEntity ? $site->managingEntity->name : 'SIN ENTIDAD',
                'status' => $site->status,
            ];
        });
        return $sites;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:active,maintenance,closed',
            'managing_entity_id' => 'nullable|exists:institutions,id',
        ]);

        $site = TouristSite::create($validated);
        return response()->json($site, 201);
    }
}
