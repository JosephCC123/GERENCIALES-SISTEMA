<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\TouristSite;

class TouristSiteController extends Controller
{
    public function index(Request $request)
    {
        $query = TouristSite::with('managingEntity');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('location', 'like', "%$search%")
                  ->orWhere('type', 'like', "%$search%");
            });
        }

        $sites = $query->paginate(15);
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

    public function update(Request $request, string $id)
    {
        $site = TouristSite::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'capacity' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:active,maintenance,closed',
            'managing_entity_id' => 'nullable|exists:institutions,id',
        ]);

        $site->update($validated);
        return response()->json($site);
    }
    public function destroy(string $id)
    {
        $site = TouristSite::findOrFail($id);
        $site->delete();
        return response()->json(null, 204);
    }
}
