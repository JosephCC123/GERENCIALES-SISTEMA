<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tourism_operators', function (Blueprint $table) {
            $table->id();
            $table->string('business_name');
            $table->string('ruc', 11)->unique();
            $table->enum('operator_type', ['agencia', 'hotel', 'transporte']);
            $table->string('license_number');
            $table->date('license_expiry');
            $table->enum('status', ['Activo', 'Pendiente', 'Vencido', 'Suspendido'])->default('Pendiente');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tourism_operators');
    }
};
