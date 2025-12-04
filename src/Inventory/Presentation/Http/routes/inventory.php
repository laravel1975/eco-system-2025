<?php

use Illuminate\Support\Facades\Route;
use TmrEcosystem\Inventory\Presentation\Http\Controllers\InventoryDashboardController;
use TmrEcosystem\Inventory\Presentation\Http\Controllers\ItemController;

/*
|--------------------------------------------------------------------------
| Inventory Web Routes
|--------------------------------------------------------------------------
|
| ไม่ต้องใส่ middleware หรือ prefix ในไฟล์นี้
| เพราะ InventoryServiceProvider จะเป็นคนครอบให้
|
*/

// Route สำหรับ Dashboard
Route::get('/dashboard', [InventoryDashboardController::class, 'index'])->name('dashboard.index');

Route::get('/items', [ItemController::class, 'index'])->name('items.index');
Route::get('items/{uuid}', [ItemController::class, 'show'])->name('items.show');
Route::get('items/create', [ItemController::class, 'create'])->name('items.create');
Route::post('items', [ItemController::class, 'store'])->name('items.store');
Route::get('items/{uuid}/edit', [ItemController::class, 'edit'])->name('items.edit');
Route::put('items/{uuid}', [ItemController::class, 'update'])->name('items.update');
Route::delete('items/{uuid}', [ItemController::class, 'destroy'])->name('items.destroy');

Route::get('/api/items/{item}', [ItemController::class, 'apiShow'])->name('items.api-show');
// ✅ เพิ่มบรรทัดนี้ (ควรอยู่นอก group หรือใน group ที่มี auth ก็ได้)
Route::get('/items/search', [ItemController::class, 'search'])->name('items.search');
