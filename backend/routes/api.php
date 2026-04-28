<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TouristSiteController;

Route::get('/test', function() {
    return response()->json(['message' => 'Test successful']);
});

Route::post('/login', [AuthController::class, 'login']);


use App\Http\Controllers\Api\VisitorController;
use App\Http\Controllers\Api\TourismOperatorController;
use App\Http\Controllers\Api\AccommodationController;
use App\Http\Controllers\Api\DailyOccupancyController;
use App\Http\Controllers\Api\CertifiedGuideController;
use App\Http\Controllers\Api\SiteCapacityLogController;
use App\Http\Controllers\Api\AuditLogController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles', 'institution');
    });

    // Módulo 2: Sitios Turísticos
    Route::apiResource('tourist-sites', TouristSiteController::class);
    
    // Módulo 4: Visitantes
    Route::apiResource('visitors', VisitorController::class);
    
    // Módulo 5: Operadores Turísticos
    Route::apiResource('tourism-operators', TourismOperatorController::class);
    
    // Módulo 6: Alojamientos y Ocupación
    Route::apiResource('accommodations', AccommodationController::class);
    Route::apiResource('daily-occupancy', DailyOccupancyController::class);
    
    // Módulo 7: Guías Certificados
    Route::apiResource('certified-guides', CertifiedGuideController::class);
    
    // Módulo 8: Capacidad y Tiempos de Espera
    Route::apiResource('capacity-logs', SiteCapacityLogController::class);
    
    // Auditoría
    Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show']);
});
