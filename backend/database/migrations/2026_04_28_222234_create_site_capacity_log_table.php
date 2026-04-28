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
        Schema::create('site_capacity_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('tourist_sites')->onDelete('cascade');
            $table->timestamp('log_time')->useCurrent();
            $table->integer('visitor_count');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_capacity_log');
    }
};
