<?php

use Illuminate\Support\Facades\Route;
use TmrEcosystem\Approval\Presentation\Http\Controllers\ApprovalRequestController;

// ตัวอย่าง Route API
// Route::post('/submit', [ApprovalRequestController::class, 'submit']);
// Route::post('/{id}/approve', [ApprovalRequestController::class, 'approve']);

Route::group(['middleware' => ['api', 'auth:sanctum']], function () {

    Route::get('/pending-list', [ApprovalRequestController::class, 'index']);
    Route::post('/action', [ApprovalRequestController::class, 'action']);

});
