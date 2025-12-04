<?php

use Illuminate\Support\Facades\Route;
use TmrEcosystem\Stock\Presentation\Http\Controllers\StockController;

Route::middleware(['web', 'auth', 'verified'])->group(function () {
    // List & Inbound
    Route::get('/', [StockController::class, 'index'])->name('index');
    Route::get('/receive', [StockController::class, 'receive'])->name('receive');
    Route::post('/receive', [StockController::class, 'processReceive'])->name('receive.process');

    // ✅ [เพิ่ม] Internal Transfer
    Route::post('/transfer', [StockController::class, 'transfer'])->name('transfer');

    // ✅ [เพิ่ม] Adjust Stock
    Route::post('/adjust', [StockController::class, 'adjust'])->name('adjust');

    // ✅ [เพิ่ม] API สำหรับดึง Location ของ Warehouse (สำหรับ Modal)
    Route::get('/api/warehouses/{uuid}/locations', [StockController::class, 'getWarehouseLocations'])->name('api.warehouse.locations');
});
