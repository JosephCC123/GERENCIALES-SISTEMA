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
        Schema::create('tourist_sites', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // Archaeological, Natural, Museum, etc.
            $table->string('location');
            $table->integer('capacity');
            $table->string('status')->default('active'); // active, maintenance, closed
            $table->foreignId('managing_entity_id')->nullable()->constrained('institutions')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tourist_sites');
    }
};
