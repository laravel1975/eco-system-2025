<?php

use Illuminate\Support\Facades\Route;
use TmrEcosystem\HRM\Presentation\Controllers\AttendanceController;
use TmrEcosystem\HRM\Presentation\Controllers\AttendanceImportController;
use TmrEcosystem\HRM\Presentation\Controllers\DepartmentController;
use TmrEcosystem\HRM\Presentation\Controllers\EmployeeController;
use TmrEcosystem\HRM\Presentation\Controllers\EmployeeDocumentController;
use TmrEcosystem\HRM\Presentation\Controllers\EmployeeEmergencyContactController;
use TmrEcosystem\HRM\Presentation\Controllers\HolidayController;
use TmrEcosystem\HRM\Presentation\Controllers\LeaveRequestController;
use TmrEcosystem\HRM\Presentation\Controllers\LeaveTypeController;
use TmrEcosystem\HRM\Presentation\Controllers\OrgChartController;
use TmrEcosystem\HRM\Presentation\Controllers\OvertimeRequestController;
use TmrEcosystem\HRM\Presentation\Controllers\PositionController;
use TmrEcosystem\HRM\Presentation\Controllers\WorkShiftController;

// --- (สำหรับ HRM Employee) ---
Route::middleware(['web', 'auth'])->prefix('hrm/employees')->name('hrm.employees.')->group(function () {

    Route::get('/', [EmployeeController::class, 'index'])->name('index')->middleware('can:view employees');
    Route::post('/', [EmployeeController::class, 'store'])->name('store')->middleware('can:create employees');
    Route::get('/{employee}/edit', [EmployeeController::class, 'edit'])->name('edit')->middleware('can:edit employees');
    Route::patch('/{employee}', [EmployeeController::class, 'update'])->name('update')->middleware('can:edit employees');
    Route::delete('/{employee}', [EmployeeController::class, 'destroy'])->name('destroy')->middleware('can:delete employees');

    Route::post('/{employee}/emergency-contacts', [EmployeeEmergencyContactController::class, 'store'])->name('emergency-contacts.store');
    Route::delete('/emergency-contacts/{contact}', [EmployeeEmergencyContactController::class, 'destroy'])->name('emergency-contacts.destroy');
});

// --- (HRM Position Routes) ---
Route::middleware(['web', 'auth'])->prefix('hrm/positions')->name('hrm.positions.')->group(function () {
    Route::get('/', [PositionController::class, 'index'])->name('index');
    Route::post('/', [PositionController::class, 'store'])->name('store');
    Route::patch('/{position}', [PositionController::class, 'update'])->name('update');
    Route::delete('/{position}', [PositionController::class, 'destroy'])->name('destroy');
});

// --- (HRM Department Routes) ---
Route::middleware(['web', 'auth'])->prefix('hrm/departments')->name('hrm.departments.')->group(function () {

    Route::get('/', [DepartmentController::class, 'index'])->name('index')->middleware('can:view departments');
    Route::post('/', [DepartmentController::class, 'store'])->name('store')->middleware('can:create departments');
    Route::patch('/{department}', [DepartmentController::class, 'update'])->name('update')->middleware('can:edit departments');
    Route::delete('/{department}', [DepartmentController::class, 'destroy'])->name('destroy')->middleware('can:delete departments');
});

Route::middleware(['web', 'auth'])->prefix('hrm')->name('hrm.')->group(function () {
    Route::get('/dashborad', [EmployeeDocumentController::class, 'dashboard'])->name('dashboard');

    Route::post('/employees/{employee}/documents', [EmployeeDocumentController::class, 'store'])->name('employees.documents.store');
    // (ลบ) DELETE /hrm/documents/{document}
    Route::delete('/documents/{document}', [EmployeeDocumentController::class, 'destroy'])->name('documents.destroy');
    // (ดาวน์โหลด) GET /hrm/documents/{document}/download
    Route::get('/documents/{document}/download', [EmployeeDocumentController::class, 'download'])->name('documents.download');
    // Organize Chart
    Route::get('/org-chart', [OrgChartController::class, 'index'])->name('org-chart.index');

    // Attendance Route
    Route::resource('attendances', AttendanceController::class)->only(['index', 'store']);
    Route::post('/attendances/import', [AttendanceImportController::class, 'store'])->name('attendances.import');
    Route::get('/attendances/import-template', [AttendanceImportController::class, 'downloadTemplate'])->name('attendances.import-template');

    Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn'])->name('attendance.clock-in');
    Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut'])->name('attendance.clock-out');

    // Overtimes Route
    Route::patch('/overtime-requests/{request}/approve', [OvertimeRequestController::class, 'approve'])->name('overtime-requests.approve');
    Route::patch('/overtime-requests/{request}/reject', [OvertimeRequestController::class, 'reject'])->name('overtime-requests.reject');
    Route::resource('overtime-requests', OvertimeRequestController::class)->only(['index', 'store', 'destroy']);

    Route::resource('work-shifts', WorkShiftController::class)->except(['show']);
    Route::resource('holidays', HolidayController::class)->except(['show']);
    Route::resource('leave-types', LeaveTypeController::class)->except(['show']);
    Route::patch('/leave-requests/{request}/approve', [LeaveRequestController::class, 'approve'])->name('leave-requests.approve');
    Route::patch('/leave-requests/{request}/reject', [LeaveRequestController::class, 'reject'])->name('leave-requests.reject');
    Route::resource('leave-requests', LeaveRequestController::class)->only(['index', 'store', 'destroy']);
});
