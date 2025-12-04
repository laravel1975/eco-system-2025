<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use TmrEcosystem\Maintenance\Domain\Models\Asset;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceRequest;
use TmrEcosystem\Maintenance\Presentation\Requests\StoreMaintenanceRequestRequest; // (1. เราใช้ Request เดิม)

class UserMaintenanceRequestController extends Controller
{
    /**
     * (Read) แสดงฟอร์มแจ้งซ่อมสำหรับพนักงาน
     */
    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;

        // (2. 👈 [แก้ไข] ดึง Asset พร้อม Warehouse (ใหม่))
        $assets = Asset::where('company_id', $companyId)
            ->where('status', 'active')
            ->with('warehouse:uuid,name') // (Eager load Relation ใหม่)
            ->get(['id', 'name', 'asset_code', 'warehouse_uuid']); // (Select 'warehouse_uuid' แทน 'location')

        return inertia('Maintenance/ServiceRequest/Create', [
            'assets' => $assets, // (ส่ง Asset (ใหม่) ไป Frontend)
        ]);
    }

    /**
     * (Create) พนักงานบันทึกคำขอแจ้งซ่อมใหม่
     */
    public function store(StoreMaintenanceRequestRequest $request): RedirectResponse
    {
        // (เมธอด Store ไม่ต้องแก้ไข เพราะ Request ถูกต้องแล้ว)
        $employeeProfile = $request->user()->profile;

        if (!$employeeProfile) {
            return redirect()->back()->with('error', 'ไม่พบข้อมูลโปรไฟล์พนักงานของคุณ');
        }

        MaintenanceRequest::create([
            'asset_id' => $request->validated('asset_id'),
            'problem_description' => $request->validated('problem_description'),
            'requested_by_employee_id' => $employeeProfile->id,
            'status' => MaintenanceRequest::STATUS_PENDING,
            'company_id' => $request->user()->company_id,
        ]);

        return redirect()->route('dashboard')
                         ->with('success', 'ส่งคำขอแจ้งซ่อมสำเร็จ! เจ้าหน้าที่จะติดต่อกลับ');
    }
}
