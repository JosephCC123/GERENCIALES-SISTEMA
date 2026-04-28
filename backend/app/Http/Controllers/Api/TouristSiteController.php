<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\TouristSite;

class TouristSiteController extends Controller
{
    public function index()
    {
        return response()->json(TouristSite::with('managingEntity')->get());
    }
}
