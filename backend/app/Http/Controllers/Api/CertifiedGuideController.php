<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CertifiedGuide;
use Illuminate\Http\Request;

class CertifiedGuideController extends Controller
{
    public function index(Request $request)
    {
        $query = CertifiedGuide::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%$search%")
                  ->orWhere('license_number', 'like', "%$search%")
                  ->orWhere('languages', 'like', "%$search%");
            });
        }

        return $query->paginate(15);
    }

    public function store(Request $request)
    {
        $v = $request->validate([
            'full_name' => 'required|string',
            'license_number' => 'required|unique:certified_guides',
            'license_expiry' => 'required|date',
            'languages' => 'required|string',
        ]);
        return response()->json(CertifiedGuide::create($v), 201);
    }

    public function show(CertifiedGuide $guide) { return $guide; }

    public function update(Request $request, CertifiedGuide $guide)
    {
        $guide->update($request->all());
        return response()->json($guide);
    }

    public function destroy(CertifiedGuide $guide)
    {
        $guide->delete();
        return response()->json(null, 204);
    }
}
