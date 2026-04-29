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
}
