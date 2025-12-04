<?php

use App\Http\Controllers\CompanyController;
use Illuminate\Support\Facades\Route;
use TmrEcosystem\IAM\Presentation\Controllers\AuditLogController;
use TmrEcosystem\IAM\Presentation\Controllers\RoleController;
use TmrEcosystem\IAM\Presentation\Controllers\TwoFactorAuthenticationController;
use TmrEcosystem\IAM\Presentation\Controllers\UserController;

// เราจะจัดกลุ่ม Route ทั้งหมดของ IAM ไว้ที่นี่
Route::middleware(['web', 'auth'])->prefix('iam')->name('iam.')->group(function () {
    Route::get('dashboard', [UserController::class, 'dashboard'])->name('dashboard');
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create')->middleware('can:create users');
    Route::post('/', [UserController::class, 'store'])->name('store')->middleware('can:create users');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit')->middleware('can:edit users');
    Route::patch('/{user}', [UserController::class, 'update'])->name('update')->middleware('can:edit users');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy')->middleware('can:delete users');
    Route::get('/{user}/link-employee', [UserController::class, 'linkToEmployee'])->name('users.link-employee')->middleware('can:edit users');
});

Route::middleware(['web', 'auth'])->prefix('iam/roles')->name('iam.roles.')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->name('index')->middleware('can:view roles');
    Route::get('/create', [RoleController::class, 'create'])->name('create')->middleware('can:create roles');
    Route::post('/', [RoleController::class, 'store'])->name('store')->middleware('can:create roles');
    Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit')->middleware('can:edit roles');
    Route::patch('/{role}', [RoleController::class, 'update'])->name('update')->middleware('can:edit roles');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy')->middleware('can:delete roles');
    Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit')->middleware('can:edit roles');
    Route::patch('/{role}', [RoleController::class, 'update'])->name('update')->middleware('can:edit roles');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy')->middleware('can:delete roles');
});

Route::middleware(['web', 'auth'])->prefix('user/two-factor-authentication')->group(function () {
    Route::post('/', [TwoFactorAuthenticationController::class, 'store'])
         ->name('two-factor.store');
    Route::put('/', [TwoFactorAuthenticationController::class, 'update'])
         ->name('two-factor.update');
    Route::delete('/', [TwoFactorAuthenticationController::class, 'destroy'])
         ->name('two-factor.destroy');
});

Route::middleware(['web', 'auth'])->prefix('iam/audit-log')->name('iam.audit-log.')->group(function () {
    Route::get('/', [AuditLogController::class, 'index'])
         ->name('index')
         ->middleware('can:view audit log'); // <-- ป้องกันด้วย Permission
});

// Company Management Routes
Route::middleware(['auth', 'verified', 'can:manage companies'])->group(function () {
    Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/create', [CompanyController::class, 'create'])->name('companies.create');
    Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');
    Route::get('/companies/{company}/edit', [CompanyController::class, 'edit'])->name('companies.edit');
    Route::patch('/companies/{company}', [CompanyController::class, 'update'])->name('companies.update');
    Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])->name('companies.destroy');
});
