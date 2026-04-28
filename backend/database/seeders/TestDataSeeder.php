<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Visitor;
use App\Models\TourismOperator;
use App\Models\CertifiedGuide;
use App\Models\TouristSite;

class TestDataSeeder extends Seeder
{
    public function run()
    {
        $site = TouristSite::first();

        Visitor::create([
            'site_id' => $site->id,
            'full_name' => 'Juan Perez',
            'document_number' => '12345678',
            'visitor_type' => 'nacional',
            'nationality' => 'Perú',
            'entry_date' => now()->toDateString(),
            'entry_time' => '10:00:00',
            'ticket_number' => 'T-001'
        ]);

        TourismOperator::create([
            'business_name' => 'Cusco Adventures SAC',
            'ruc' => '20123456789',
            'email' => 'contacto@cuscoadv.com',
            'phone' => '987654321',
            'operator_type' => 'agencia',
            'license_number' => 'LIC-12345',
            'license_expiry' => '2026-12-31'
        ]);

        CertifiedGuide::create([
            'full_name' => 'Maria Quispe',
            'license_number' => 'G-9988',
            'license_expiry' => '2027-01-01',
            'languages' => 'Español, Inglés, Quechua',
            'specialization' => 'Arqueología'
        ]);
    }
}
