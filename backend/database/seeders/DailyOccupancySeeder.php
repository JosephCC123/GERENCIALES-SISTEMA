<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Accommodation;
use Carbon\Carbon;

class DailyOccupancySeeder extends Seeder
{
    public function run()
    {
        $accommodations = Accommodation::all();
        $records = [];
        $startDate = Carbon::now()->subDays(30);

        foreach ($accommodations as $acc) {
            for ($i = 0; $i < 30; $i++) {
                $date = $startDate->copy()->addDays($i);
                $available = $acc->total_rooms;
                
                // Random occupancy between 30% and 95%
                $occupied = rand((int)($available * 0.3), (int)($available * 0.95));
                $rate = $available > 0 ? ($occupied / $available) * 100 : 0;

                $records[] = [
                    'accommodation_id' => $acc->id,
                    'date' => $date->format('Y-m-d'),
                    'occupied_rooms' => $occupied,
                    'available_rooms' => $available,
                    'occupancy_rate' => $rate,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
        }

        // Insert in chunks
        $chunks = array_chunk($records, 1000);
        foreach ($chunks as $chunk) {
            DB::table('daily_occupancy')->insert($chunk);
        }
    }
}
