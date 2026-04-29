<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AuditLog;
use App\Models\User;

class AuditLogSeeder extends Seeder
{
    public function run()
    {
        $user = User::first();
        if (!$user) return;

        $actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'];
        $tables = ['visitors', 'tourist_sites', 'tourism_operators', 'certified_guides', 'accommodations'];

        for ($i = 0; $i < 50; $i++) {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => $actions[array_rand($actions)],
                'table_name' => $tables[array_rand($tables)],
                'record_id' => rand(1, 100),
                'old_values' => json_encode(['status' => 'inactive']),
                'new_values' => json_encode(['status' => 'active']),
                'ip_address' => '192.168.1.' . rand(1, 255),
                'created_at' => now()->subMinutes(rand(1, 10000))
            ]);
        }
    }
}
