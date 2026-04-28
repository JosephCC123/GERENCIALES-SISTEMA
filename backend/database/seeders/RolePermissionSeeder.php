<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Institution;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Default Institution
        $dircetur = Institution::create([
            'name' => 'DIRCETUR Cusco',
            'type' => 'Government',
            'code' => 'DIR-CUS-001',
            'contact_info' => ['email' => 'info@dirceturcusco.gob.pe', 'phone' => '+51 084 123456']
        ]);

        // 2. Create Roles
        $adminRole = Role::create([
            'name' => 'Administrador del Sistema',
            'slug' => 'admin',
            'description' => 'Acceso total al sistema'
        ]);

        $ejecutivoRole = Role::create([
            'name' => 'Ejecutivo',
            'slug' => 'ejecutivo',
            'description' => 'Visualización de KPIs y reportes'
        ]);

        $operadorRole = Role::create([
            'name' => 'Operador Turístico',
            'slug' => 'operador',
            'description' => 'Gestión de servicios y flujo'
        ]);

        // 3. Create Permissions (Examples)
        $viewDashboard = Permission::create(['name' => 'Ver Dashboard', 'slug' => 'view-dashboard', 'module' => 'Dashboard']);
        $manageUsers = Permission::create(['name' => 'Gestionar Usuarios', 'slug' => 'manage-users', 'module' => 'Usuarios']);
        $viewReports = Permission::create(['name' => 'Ver Reportes', 'slug' => 'view-reports', 'module' => 'Reportes']);

        // 4. Assign Permissions to Roles
        $adminRole->permissions()->attach([$viewDashboard->id, $manageUsers->id, $viewReports->id]);
        $ejecutivoRole->permissions()->attach([$viewDashboard->id, $viewReports->id]);

        // 5. Create Super Admin User
        $admin = User::create([
            'name' => 'Admin Cusco',
            'email' => 'admin@cuscoturismo.gob.pe',
            'password' => Hash::make('12345678'),
            'institution_id' => $dircetur->id,
            'status' => 'active'
        ]);

        $admin->roles()->attach($adminRole->id);
    }
}
