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
            'name' => 'Choquequirao',
            'type' => 'Archaeological',
            'location' => 'Santa Teresa',
            'capacity' => 500,
            'status' => 'active',
            'managing_entity_id' => $dircetur->id
        ]);

        TouristSite::create([
            'name' => 'Ollantaytambo',
            'type' => 'Archaeological',
            'location' => 'Urubamba',
            'capacity' => 1200,
            'status' => 'active',
            'managing_entity_id' => $dircetur->id
        ]);

        TouristSite::create([
            'name' => 'Salineras de Maras',
            'type' => 'Natural',
            'location' => 'Maras',
            'capacity' => 800,
            'status' => 'active',
            'managing_entity_id' => $dircetur->id
        ]);

        TouristSite::create([
            'name' => 'Moray',
            'type' => 'Archaeological',
            'location' => 'Maras',
            'capacity' => 600,
            'status' => 'active',
            'managing_entity_id' => $dircetur->id
        ]);
    }
}
