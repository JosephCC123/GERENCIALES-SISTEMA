<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\TouristSite;
use App\Models\Institution;

class TouristSiteSeeder extends Seeder
{
    public function run(): void
    {
        $dircetur = Institution::where('code', 'DIR-CUS-001')->first();

        TouristSite::create([
            'name' => 'Machu Picchu',
            'type' => 'Archaeological',
            'location' => 'Aguas Calientes',
            'capacity' => 2500,
            'status' => 'active',
            'managing_entity_id' => $dircetur->id
        ]);

        TouristSite::create([
            'name' => 'Sacsayhuaman',
            'type' => 'Archaeological',
            'location' => 'Cusco',
            'capacity' => 1500,
            'status' => 'active',
            'managing_entity_id' => $dircetur->id
        ]);

        TouristSite::create([
            'name' => 'Pisac',
            'type' => 'Archaeological',
            'location' => 'Calca',
            'capacity' => 1000,
            'status' => 'active',
            'managing_entity_id' => $dircetur->id
        ]);
    }
}
