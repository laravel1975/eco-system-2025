<?php

use Illuminate\Support\Facades\Route;
use TmrEcosystem\Logistics\Presentation\Http\Controllers\PickingController;
use TmrEcosystem\Logistics\Presentation\Http\Controllers\ShipmentController;
use TmrEcosystem\Logistics\Presentation\Http\Controllers\VehicleController;
use TmrEcosystem\Logistics\Presentation\Http\Controllers\DeliveryController;
use TmrEcosystem\Logistics\Presentation\Http\Controllers\DeliveryPdfController;
use TmrEcosystem\Logistics\Presentation\Http\Controllers\PickingPdfController;
use TmrEcosystem\Logistics\Presentation\Http\Controllers\ReturnNoteController;
use TmrEcosystem\Logistics\Presentation\Http\Controllers\ReturnNotePdfController;
use TmrEcosystem\Logistics\Presentation\Http\Controllers\ShipmentPdfController;

/*
|--------------------------------------------------------------------------
| Logistics Web Routes
|--------------------------------------------------------------------------
*/

// Picking Routes
Route::get('/picking', [PickingController::class, 'index'])->name('picking.index');
Route::get('/picking/{id}/process', [PickingController::class, 'show'])->name('picking.process');
Route::get('/picking/{id}', [PickingController::class, 'reViewItem'])->name('picking.show');
Route::post('/picking/{id}/confirm', [PickingController::class, 'confirm'])->name('picking.confirm');
Route::post('/picking/{id}/assign', [PickingController::class, 'assign'])->name('picking.assign');

Route::get('/picking/{id}/pdf', [PickingPdfController::class, 'download'])->name('picking.pdf');

// Vehicles Management
Route::resource('vehicles', VehicleController::class)->except(['create', 'edit', 'show']);
Route::resource('shipments', ShipmentController::class);
Route::post('/shipments/{id}/status', [ShipmentController::class, 'updateStatus'])->name('shipments.status');
Route::post('/shipments/{id}/remove-delivery', [ShipmentController::class, 'removeDelivery'])->name('shipments.remove-delivery');
Route::get('/shipments/{id}/manifest', [ShipmentPdfController::class, 'download'])->name('shipments.manifest');

// API สำหรับดึง Items (ใช้ Ajax ใน Modal)
Route::get('/delivery/{id}/items', [ShipmentController::class, 'getDeliveryItems'])->name('delivery.items');

// Unload Delivery from Shipment
Route::post('/shipments/{id}/unload', [ShipmentController::class, 'unload'])->name('shipments.unload');

// --- Delivery Routes ---
Route::get('/delivery', [DeliveryController::class, 'index'])->name('delivery.index');
Route::get('/delivery/{id}/process', [DeliveryController::class, 'show'])->name('delivery.process');
Route::get('/delivery/{id}/', [DeliveryController::class, 'reViewItem'])->name('delivery.show');
Route::put('/delivery/{id}', [DeliveryController::class, 'update'])->name('delivery.update');

Route::get('/delivery/{id}/pdf', [DeliveryPdfController::class, 'download'])->name('delivery.pdf');

// ✅ [เพิ่ม] Route สำหรับ Cancel & Return
Route::post('/delivery/{id}/cancel-return', [DeliveryController::class, 'cancelAndReturn'])->name('delivery.cancel-return');

// Return Note Routes
Route::get('/return-notes', [ReturnNoteController::class, 'index'])->name('return-notes.index');
Route::get('/return-notes/{id}/process', [ReturnNoteController::class, 'show'])->name('return-notes.process');
Route::get('/return-notes/{id}', [ReturnNoteController::class, 'reViewItem'])->name('return-notes.show');
Route::post('/return-notes/{id}/confirm', [ReturnNoteController::class, 'confirm'])->name('return-notes.confirm');

Route::get('/return-notes/{id}/pdf', [ReturnNotePdfController::class, 'download'])->name('return-notes.pdf');

// Return Note Evidence Actions
Route::post('/return-notes/{id}/evidence', [ReturnNoteController::class, 'uploadEvidence'])->name('return-notes.evidence.store');
Route::delete('/return-notes/evidence/{evidenceId}', [ReturnNoteController::class, 'removeEvidence'])->name('return-notes.evidence.destroy');
