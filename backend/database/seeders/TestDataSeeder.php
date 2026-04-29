<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Visitor;
use App\Models\TourismOperator;
use App\Models\CertifiedGuide;
use App\Models\TouristSite;
use App\Models\Accommodation;

class TestDataSeeder extends Seeder
{
    public function run()
    {
        $faker = \Faker\Factory::create('es_PE');
        $sites = TouristSite::all();
        $operators = TourismOperator::all();

        if ($sites->isEmpty()) {
            return;
        }

        // Create 40 Accommodations
        for ($i = 0; $i < 40; $i++) {
            Accommodation::create([
                'operator_id' => $operators->isEmpty() ? null : $operators->random()->id,
                'name' => $faker->company . ' ' . $faker->randomElement(['Hotel', 'Hostal', 'Palace', 'Inn', 'Resort', 'Suites']),
                'type' => $faker->randomElement(['Hotel', 'Hostal', 'Albergue', 'Apart-Hotel']),
                'category' => $faker->randomElement(['1 Estrella', '2 Estrellas', '3 Estrellas', '4 Estrellas', '5 Estrellas']),
                'total_rooms' => rand(10, 150),
                'phone' => $faker->phoneNumber,
                'address' => $faker->address,
                'status' => $faker->randomElement(['Activo', 'Mantenimiento', 'Inactivo'])
            ]);
        }

        // Create 300 Visitors with diverse data
        for ($i = 0; $i < 300; $i++) {
            Visitor::create([
                'site_id' => $sites->random()->id,
                'full_name' => $faker->name,
                'document_number' => $faker->numerify('########'),
                'visitor_type' => $faker->randomElement(['nacional', 'extranjero']),
                'nationality' => $faker->country,
                'entry_date' => now()->subDays(rand(0, 90))->toDateString(),
                'entry_time' => $faker->time(),
                'ticket_number' => 'T-' . $faker->unique()->randomNumber(6)
            ]);
        }

        // Create 60 Operators
        for ($i = 0; $i < 60; $i++) {
            TourismOperator::create([
                'business_name' => $faker->company . ' ' . $faker->randomElement(['Tours', 'Expeditions', 'Travel', 'Adventure', 'Services']),
                'ruc' => '20' . $faker->unique()->numerify('#########'),
                'email' => $faker->companyEmail,
                'phone' => $faker->phoneNumber,
                'operator_type' => $faker->randomElement(['agencia', 'hotel', 'transporte']),
                'license_number' => 'LIC-' . $faker->unique()->randomNumber(6),
                'license_expiry' => $faker->dateTimeBetween('+1 year', '+5 years')->format('Y-m-d'),
                'status' => $faker->randomElement(['Activo', 'Pendiente', 'Vencido', 'Suspendido']),
                'address' => $faker->address
            ]);
        }

        // Create 50 Certified Guides
        for ($i = 0; $i < 50; $i++) {
            CertifiedGuide::create([
                'full_name' => $faker->name,
                'license_number' => 'G-' . $faker->unique()->randomNumber(5),
                'license_expiry' => $faker->dateTimeBetween('+1 year', '+6 years')->format('Y-m-d'),
                'languages' => $faker->randomElement(['Español, Inglés', 'Español, Francés, Inglés', 'Español, Alemán, Ruso', 'Español, Quechua, Inglés', 'Español, Portugués']),
                'specialization' => $faker->randomElement(['Arqueología', 'Montañismo', 'Turismo Cultural', 'Aves y Naturaleza', 'Misticismo']),
                'phone' => $faker->phoneNumber,
                'email' => $faker->safeEmail,
                'status' => $faker->randomElement(['Activo', 'Vencido'])
            ]);
        }
    }
}
