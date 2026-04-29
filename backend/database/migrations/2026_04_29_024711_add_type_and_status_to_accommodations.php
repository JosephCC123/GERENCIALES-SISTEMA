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
        Schema::table('accommodations', function (Blueprint $table) {
            $table->string('type')->default('Hotel')->after('name');
            $table->string('status')->default('Activo')->after('address');
            $table->string('category')->change(); // Change to string for more flexibility like '3 Estrellas'
            $table->unsignedBigInteger('operator_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accommodations', function (Blueprint $table) {
            $table->dropColumn(['type', 'status']);
            $table->integer('category')->change();
            $table->unsignedBigInteger('operator_id')->nullable(false)->change();
        });
    }
};
