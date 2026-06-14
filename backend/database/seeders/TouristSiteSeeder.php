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

        $sites = [
            ['name' => 'Machu Picchu (Llaqta)', 'type' => 'Archaeological', 'location' => 'Aguas Calientes', 'capacity' => 4044],
            ['name' => 'Sacsayhuamán', 'type' => 'Archaeological', 'location' => 'Cusco', 'capacity' => 2500],
            ['name' => 'Qorikancha', 'type' => 'Cultural', 'location' => 'Cusco', 'capacity' => 1500],
            ['name' => 'Ollantaytambo', 'type' => 'Archaeological', 'location' => 'Urubamba', 'capacity' => 1200],
            ['name' => 'Písac', 'type' => 'Archaeological', 'location' => 'Písac', 'capacity' => 1000],
            ['name' => 'Chinchero', 'type' => 'Archaeological', 'location' => 'Chinchero', 'capacity' => 800],
            ['name' => 'Moray', 'type' => 'Archaeological', 'location' => 'Maras', 'capacity' => 600],
            ['name' => 'Salineras de Maras', 'type' => 'Natural', 'location' => 'Maras', 'capacity' => 800],
            ['name' => 'Montaña de 7 Colores (Vinicunca)', 'type' => 'Natural', 'location' => 'Pitumarca', 'capacity' => 1500],
            ['name' => 'Laguna Humantay', 'type' => 'Natural', 'location' => 'Mollepata', 'capacity' => 1000],
            ['name' => 'Tipón', 'type' => 'Archaeological', 'location' => 'Oropesa', 'capacity' => 500],
            ['name' => 'Pikillaqta', 'type' => 'Archaeological', 'location' => 'Lucre', 'capacity' => 400],
            ['name' => 'Tambomachay', 'type' => 'Archaeological', 'location' => 'Cusco', 'capacity' => 600],
            ['name' => 'Qenqo', 'type' => 'Archaeological', 'location' => 'Cusco', 'capacity' => 500],
            ['name' => 'Puca Pucara', 'type' => 'Archaeological', 'location' => 'Cusco', 'capacity' => 300],
            ['name' => 'Choquequirao', 'type' => 'Archaeological', 'location' => 'Santa Teresa', 'capacity' => 500],
            ['name' => 'Palcoyo (Montaña de Colores)', 'type' => 'Natural', 'location' => 'Checacupe', 'capacity' => 800],
            ['name' => 'Valle Sur', 'type' => 'Cultural', 'location' => 'Cusco', 'capacity' => 1000],
            ['name' => 'Tres Cruces de Paucartambo', 'type' => 'Natural', 'location' => 'Paucartambo', 'capacity' => 200],
            ['name' => 'Parque Nacional del Manu', 'type' => 'Natural', 'location' => 'Madre de Dios / Cusco', 'capacity' => 150]
        ];

        foreach ($sites as $site) {
            TouristSite::create([
                'name' => $site['name'],
                'type' => $site['type'],
                'location' => $site['location'],
                'capacity' => $site['capacity'],
                'status' => 'active',
                'managing_entity_id' => $dircetur->id
            ]);
        }
    }
}
