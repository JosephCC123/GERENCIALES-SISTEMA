<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\TouristSite;
use Carbon\Carbon;
use Faker\Factory as Faker;

class GenerateHistoricalDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bi:generate-history {--count=100000 : The number of visitors to generate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate massive historical data for BI analysis';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = (int) $this->option('count');
        $this->info("Iniciando generación de {$count} visitantes históricos...");

        $faker = Faker::create('es_PE');
        $sites = TouristSite::pluck('id')->toArray();

        if (empty($sites)) {
            $this->error('No hay sitios turísticos en la base de datos. Ejecuta los seeders base primero.');
            return;
        }

        $purposes = ['Vacaciones', 'Vacaciones', 'Vacaciones', 'Negocios', 'Estudio', 'Evento', 'Otro'];
        $paymentMethods = ['Efectivo', 'Tarjeta', 'Online', 'Agencia'];
        $weatherConditions = ['Soleado', 'Soleado', 'Nublado', 'Lluvioso'];
        $ticketTypes = ['Adulto', 'Adulto', 'Estudiante', 'Niño'];

        $startDate = Carbon::now()->subYears(5);
        $endDate = Carbon::now();
        $totalDays = $startDate->diffInDays($endDate);

        $chunkSize = 2000;
        $batches = ceil($count / $chunkSize);
        $bar = $this->output->createProgressBar($count);

        $insertedCount = 0;

        for ($i = 0; $i < $batches; $i++) {
            $data = [];
            $currentBatchSize = min($chunkSize, $count - $insertedCount);

            for ($j = 0; $j < $currentBatchSize; $j++) {
                // Simulate seasonality: more visitors in middle of the year (June-August)
                $randomDay = rand(0, $totalDays);
                $entryDate = clone $startDate;
                $entryDate->addDays($randomDay);
                
                // Bias logic for seasonality
                $month = $entryDate->month;
                if (!in_array($month, [6, 7, 8]) && rand(1, 100) > 60) {
                    // Try to push date to high season 40% of the time
                    $entryDate->month(rand(6, 8));
                    // Adjust day to be valid
                    $entryDate->day(min($entryDate->day, $entryDate->daysInMonth));
                }

                // Realistic probability distribution for Cusco tourists
                $rand = rand(1, 100);
                if ($rand <= 35) {
                    $nationality = 'Perú';
                } elseif ($rand <= 55) {
                    $nationality = 'Estados Unidos';
                } elseif ($rand <= 65) {
                    $nationality = 'Brasil';
                } elseif ($rand <= 72) {
                    $nationality = 'Colombia';
                } elseif ($rand <= 78) {
                    $nationality = 'Argentina';
                } elseif ($rand <= 84) {
                    $nationality = 'Chile';
                } elseif ($rand <= 88) {
                    $nationality = 'España';
                } elseif ($rand <= 91) {
                    $nationality = 'Francia';
                } elseif ($rand <= 94) {
                    $nationality = 'Reino Unido';
                } elseif ($rand <= 97) {
                    $nationality = 'Alemania';
                } else {
                    $nationality = $faker->randomElement(['Italia', 'Canadá', 'México', 'Japón', 'Australia', 'Ecuador', 'Bolivia', 'Suiza', 'Países Bajos', 'Corea del Sur']);
                }
                
                $isNacional = $nationality === 'Perú';
                $visitorType = $isNacional ? 'nacional' : 'extranjero';

                // Age logic
                $age = $faker->biasedNumberBetween(18, 70, function($x) { return 1 - sqrt($x); });
                $ticket = 'Adulto';
                if ($age < 12) $ticket = 'Niño';
                elseif ($age < 25 && rand(0,1)) $ticket = 'Estudiante';
                else $ticket = $faker->randomElement(['Adulto', 'Adulto', 'Adulto', 'Tercera Edad']);

                $data[] = [
                    'site_id' => $faker->randomElement($sites),
                    'full_name' => $faker->name,
                    'document_number' => $faker->numerify('########'),
                    'visitor_type' => $visitorType,
                    'nationality' => $nationality,
                    'entry_date' => $entryDate->toDateString(),
                    'entry_time' => $faker->time('H:i:s', '17:00:00'), // Random time before 5 PM
                    'exit_time' => null,
                    'ticket_number' => 'T-' . strtoupper($faker->bothify('?????-#####')),
                    'age' => $age,
                    'gender' => $faker->randomElement(['M', 'F', 'O']),
                    'ticket_type' => $ticket,
                    'payment_method' => $faker->randomElement($paymentMethods),
                    'purpose_of_visit' => $faker->randomElement($purposes),
                    'weather_condition' => $faker->randomElement($weatherConditions),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            DB::table('visitors')->insert($data);
            $insertedCount += $currentBatchSize;
            $bar->advance($currentBatchSize);
        }

        $bar->finish();
        $this->info("\n¡Generación completada exitosamente! Se insertaron {$insertedCount} registros.");
    }
}
