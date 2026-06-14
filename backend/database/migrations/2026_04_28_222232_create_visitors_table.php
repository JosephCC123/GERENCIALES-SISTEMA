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
        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('tourist_sites')->onDelete('cascade');
            $table->string('full_name');
            $table->string('document_number');
            $table->enum('visitor_type', ['nacional', 'extranjero']);
            $table->string('nationality');
            $table->date('entry_date');
            $table->time('entry_time');
            $table->time('exit_time')->nullable();
            $table->string('ticket_number')->nullable();
            
            // BI Enrichment Fields
            $table->integer('age')->nullable();
            $table->enum('gender', ['M', 'F', 'O'])->nullable();
            $table->string('ticket_type')->nullable(); // Adulto, Estudiante, Niño
            $table->string('payment_method')->nullable(); // Efectivo, Tarjeta, Online, Agencia
            $table->string('purpose_of_visit')->nullable(); // Vacaciones, Negocios, Estudio, Evento, Otro
            $table->string('weather_condition')->nullable(); // Soleado, Lluvioso, Nublado

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};
