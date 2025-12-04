<?php

use Illuminate\Support\Facades\Route;
use TmrEcosystem\Communication\Presentation\Http\Controllers\CommunicationController;

// ไม่ต้องมี Middleware group ซ้ำ เพราะใส่ไว้ใน Provider แล้ว
Route::get('/messages', [CommunicationController::class, 'index'])->name('messages.index');
Route::post('/messages', [CommunicationController::class, 'store'])->name('messages.store');

// ผลลัพธ์ชื่อเต็มจะเป็น: api.communication.messages.index
