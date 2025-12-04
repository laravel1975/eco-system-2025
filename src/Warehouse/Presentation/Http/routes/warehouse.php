<?php

use Illuminate\Support\Facades\Route;
use TmrEcosystem\Warehouse\Presentation\Http\Controllers\WarehouseController;
// ✅ Import Controller ใหม่
use TmrEcosystem\Warehouse\Presentation\Http\Controllers\StorageLocationController;

/*
|--------------------------------------------------------------------------
| Warehouse Web Routes
|--------------------------------------------------------------------------
*/

// Warehouse CRUD
Route::get('/', [WarehouseController::class, 'index'])->name('index');
Route::get('/create', [WarehouseController::class, 'create'])->name('create');
Route::post('/', [WarehouseController::class, 'store'])->name('store');

// ✅ Location Management Routes (Nested Resource)
// URL: /warehouses/{warehouse}/locations
Route::prefix('{warehouse}/locations')->name('locations.')->group(function () {

    // หน้า List Locations ของคลังนั้นๆ
    Route::get('/', [StorageLocationController::class, 'index'])->name('index');

    // หน้าฟอร์มสร้าง Location
    Route::get('/create', [StorageLocationController::class, 'create'])->name('create'); // (ต้องเพิ่ม method นี้ใน Controller ด้วย)

    // บันทึก Location
    Route::post('/', [StorageLocationController::class, 'store'])->name('store');
});
