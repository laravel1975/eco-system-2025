<?php

use Illuminate\Support\Facades\Route;
use TmrEcosystem\Maintenance\Presentation\Controllers\ActivityTypeController;
// (สำคัญ) ระบุ Namespace ของ Controller ใน Bounded Context นี้
use TmrEcosystem\Maintenance\Presentation\Controllers\AssetController;
use TmrEcosystem\Maintenance\Presentation\Controllers\AssetParetoReportController;
use TmrEcosystem\Maintenance\Presentation\Controllers\CostReportController;
use TmrEcosystem\Maintenance\Presentation\Controllers\DowntimeReportController;
use TmrEcosystem\Maintenance\Presentation\Controllers\FailureCodeController;
use TmrEcosystem\Maintenance\Presentation\Controllers\SparePartController;
use TmrEcosystem\Maintenance\Presentation\Controllers\MaintenanceDashboardController;
use TmrEcosystem\Maintenance\Presentation\Controllers\MaintenanceRequestController;
use TmrEcosystem\Maintenance\Presentation\Controllers\WorkOrderController;
use TmrEcosystem\Maintenance\Presentation\Controllers\MaintenanceTypeController;
use TmrEcosystem\Maintenance\Presentation\Controllers\MaintenanceAssignmentController;
use TmrEcosystem\Maintenance\Presentation\Controllers\MaintenancePlanController;
use TmrEcosystem\Maintenance\Presentation\Controllers\UserMaintenanceRequestController;
use TmrEcosystem\Maintenance\Presentation\Controllers\WorkOrderAttachmentController;
use TmrEcosystem\Maintenance\Presentation\Controllers\WorkOrderSparePartController;
use TmrEcosystem\Maintenance\Presentation\Controllers\MaintenanceCalendarController;
use TmrEcosystem\Maintenance\Presentation\Controllers\MaintenanceReportController;
use TmrEcosystem\Maintenance\Presentation\Controllers\MaintenanceTaskController;
use TmrEcosystem\Maintenance\Presentation\Controllers\MaintenanceTechnicianController;
use TmrEcosystem\Maintenance\Presentation\Controllers\ParetoReportController;
use TmrEcosystem\Maintenance\Presentation\Controllers\TechnicianReportController;

// (เพิ่ม Controller อื่นๆ ที่นี่เมื่อสร้าง)

Route::middleware(['web', 'auth'])->prefix('maintenance')->name('maintenance.')->group(function () {
    // หน้า Dashboard & Report
    Route::get('dashboard', [MaintenanceDashboardController::class, 'index'])->name('dashboard.index');
    Route::get('reports', [MaintenanceReportController::class, 'index'])->name('reports.index');
    Route::get('reports/pareto', [ParetoReportController::class, 'index'])->name('reports.pareto');
    Route::get('reports/technician', [TechnicianReportController::class, 'index'])->name('reports.technician');
    Route::get('reports/cost', [CostReportController::class, 'index'])->name('reports.cost');
    Route::get('reports/downtime', [DowntimeReportController::class, 'index'])->name('reports.downtime');
    Route::get('reports/asset-pareto', [AssetParetoReportController::class, 'index'])->name('reports.asset-pareto');

    // (สำหรับ PDF - ต้องติดตั้ง dompdf ก่อน)
    Route::get('reports/technician/pdf', [TechnicianReportController::class, 'exportPdf'])->name('reports.technician.pdf');

    Route::get('/service-request', [UserMaintenanceRequestController::class, 'create'])->name('service-request.create');
    Route::post('/service-request', [UserMaintenanceRequestController::class, 'store'])->name('service-request.store');

    // Route สำหรับติ๊ก Checklist
    Route::post('/tasks/{task}/toggle', [MaintenanceTaskController::class, 'toggle'])
        ->name('tasks.toggle');

    // (หน้า Shell ของปฏิทิน - Inertia)
    Route::get('calendar', [MaintenanceCalendarController::class, 'index'])
        ->name('calendar.index');

    Route::get('technicians', [MaintenanceTechnicianController::class, 'index'])
        ->name('technicians.index');

    // (Endpoint สำหรับ FullCalendar - JSON)
    // (เราใช้ 'api' prefix เพื่อความชัดเจน แต่ยังคงอยู่ใน web middleware)
    Route::get('api/calendar-events', [MaintenanceCalendarController::class, 'events'])
        ->name('calendar.events.api');

    // --- (Feature A) Maintenance Requests ---
    Route::group(['prefix' => 'requests', 'as' => 'requests.'], function () {

        // (แสดงรายการคำขอ)
        Route::get('/', [MaintenanceRequestController::class, 'index'])
            ->name('index');

        // (สร้างคำขอ - จากฟอร์มของพนักงาน)
        Route::post('/', [MaintenanceRequestController::class, 'store'])
            ->name('store');

        // (อนุมัติคำขอ และสร้าง Work Order)
        Route::post('/{maintenanceRequest}/approve', [MaintenanceRequestController::class, 'approve'])
            ->name('approve');

        // (ปฏิเสธคำขอ)
        Route::post('/{maintenanceRequest}/reject', [MaintenanceRequestController::class, 'reject'])
            ->name('reject');
    });


    // --- (Feature D, E) Work Order Management (ส่วนหลัก) ---
    Route::group(['prefix' => 'work-orders', 'as' => 'work-orders.'], function () {

        // (Workflow) การเปลี่ยนสถานะ (ใช้ POST หรือ PUT ก็ได้)
        Route::post('/{workOrder}/start', [WorkOrderController::class, 'startWork'])
            ->name('workflow.start');

        Route::post('/{workOrder}/complete', [WorkOrderController::class, 'completeWork'])
            ->name('workflow.complete');

        Route::post('/{workOrder}/close', [WorkOrderController::class, 'closeWork'])
            ->name('workflow.close');

        // (Nested Feature D) การมอบหมายช่าง
        Route::post('/{workOrder}/assignments', [MaintenanceAssignmentController::class, 'store'])
            ->name('assignments.store');
        Route::delete('/{workOrder}/assignments/{assignment}', [MaintenanceAssignmentController::class, 'destroy'])
            ->name('assignments.destroy');
        // ( [ใหม่] Route สำหรับมอบหมายช่างภายใน (Internal))
        Route::post('/{workOrder}/assignments/technician', [MaintenanceAssignmentController::class, 'storeTechnician'])
            ->name('assignments.store-technician');

        // ( [ใหม่] Route สำหรับมอบหมายผู้รับเหมา (External))
        Route::post('/{workOrder}/assignments/contractor', [MaintenanceAssignmentController::class, 'storeContractor'])
            ->name('assignments.store-contractor');

        // (Nested Feature D) ไฟล์แนบ
        Route::post('/{workOrder}/attachments', [WorkOrderAttachmentController::class, 'store'])
            ->name('attachments.store');
        Route::delete('/{workOrder}/attachments/{attachment}', [WorkOrderAttachmentController::class, 'destroy'])
            ->name('attachments.destroy');

        // (Nested Feature E) การใช้อะไหล่
        Route::post('/{workOrder}/spare-parts', [WorkOrderSparePartController::class, 'store'])
            ->name('spare-parts.store');
        Route::delete('/{workOrder}/spare-parts/{sparePartLog}', [WorkOrderSparePartController::class, 'destroy'])
            ->name('spare-parts.destroy');
    });

    // (CRUD หลักของ Work Order - วางไว้ล่างสุดเพื่อให้ Route ด้านบนทำงานก่อน)
    Route::resource('work-orders', WorkOrderController::class);

    // (CRUD แผน PM)
    Route::resource('plans', MaintenancePlanController::class);


    // --- (Admin / Settings) ---

    // (CRUD ประเภทงานซ่อม)
    Route::resource('types', MaintenanceTypeController::class)->except(['show']); // (ปกติไม่จำเป็นต้องมีหน้า Show)

    // RCA (Root Cause Analysis) และ Efficiency Analysis
    Route::resource('activity-types', ActivityTypeController::class)->except(['show']);
    Route::resource('failure-codes', FailureCodeController::class)->except(['show']);

    // --- (CRUD ทรัพย์สิน) ---
    Route::resource('assets', AssetController::class);

    // ( ⬇️ เพิ่มส่วนนี้ ⬇️ )
    // --- (CRUD อะไหล่ และการปรับสต็อก) ---
    Route::post('spare-parts/{sparePart}/adjust-stock', [SparePartController::class, 'adjustStock'])->name('spare-parts.adjust-stock');
    Route::resource('spare-parts', SparePartController::class);


    // (CRUD แผน PM - รอสร้าง Controller)
    // Route::resource('plans', MaintenancePlanController::class);
});
