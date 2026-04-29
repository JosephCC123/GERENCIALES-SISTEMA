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
        $faker = \Faker\Factory::create('es_PE');
        $sites = TouristSite::all();

        if ($sites->isEmpty()) {
            return;
        }

        // Create 100 Visitors with diverse data
        for ($i = 0; $i < 100; $i++) {
            Visitor::create([
                'site_id' => $sites->random()->id,
                'full_name' => $faker->name,
                'document_number' => $faker->numerify('########'),
                'visitor_type' => $faker->randomElement(['nacional', 'extranjero']),
                'nationality' => $faker->country,
                'entry_date' => now()->subDays(rand(0, 60))->toDateString(),
                'entry_time' => $faker->time(),
                'ticket_number' => 'T-' . $faker->unique()->randomNumber(6)
            ]);
        }

        // Create 30 Operators
        for ($i = 0; $i < 30; $i++) {
            TourismOperator::create([
                'business_name' => $faker->company . ' ' . $faker->randomElement(['Tours', 'Expeditions', 'Travel', 'Adventure']),
                'ruc' => '20' . $faker->unique()->numerify('#########'),
                'email' => $faker->companyEmail,
                'phone' => $faker->phoneNumber,
                'operator_type' => $faker->randomElement(['agencia', 'hotel', 'transporte']),
                'license_number' => 'LIC-' . $faker->unique()->randomNumber(6),
                'license_expiry' => $faker->dateTimeBetween('+1 year', '+4 years')->format('Y-m-d'),
                'status' => $faker->randomElement(['Activo', 'Pendiente', 'Vencido', 'Suspendido']),
                'address' => $faker->address
            ]);
        }

        // Create 25 Certified Guides
        for ($i = 0; $i < 25; $i++) {
            CertifiedGuide::create([
                'full_name' => $faker->name,
                'license_number' => 'G-' . $faker->unique()->randomNumber(5),
                'license_expiry' => $faker->dateTimeBetween('+6 months', '+5 years')->format('Y-m-d'),
                'languages' => $faker->randomElement(['Español, Inglés', 'Español, Francés, Inglés', 'Español, Alemán', 'Español, Quechua, Inglés', 'Español, Italiano']),
                'specialization' => $faker->randomElement(['Arqueología', 'Montañismo', 'Turismo Cultural', 'Gastronomía Local', 'Ecoturismo']),
                'phone' => $faker->phoneNumber,
                'email' => $faker->safeEmail,
                'status' => $faker->randomElement(['Activo', 'Vencido'])
            ]);
        }
    }
}
