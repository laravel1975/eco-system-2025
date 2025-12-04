<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller; // (ใช้ Controller หลักของ Laravel)
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceRequest;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceType; // (เราต้องสร้างโมเดลนี้ทีหลัง)
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;
use TmrEcosystem\Maintenance\Presentation\Requests\StoreMaintenanceRequestRequest;

class MaintenanceRequestController extends Controller
{
    /**
     * (Read) แสดงรายการคำขอแจ้งซ่อมทั้งหมด (สำหรับ Admin/Manager)
     * (*** อัปเกรดใหม่ ***)
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $query = MaintenanceRequest::where('company_id', $companyId)
            ->with([
                'requester:id,first_name,last_name',
                'asset:id,name,asset_code' // (ตอนนี้เรา with 'asset' ได้แล้ว)
            ])
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')") // (Pending ขึ้นก่อน)
            ->latest();

        // (Filter: Status)
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $requests = $query->paginate(15)->withQueryString();

        return inertia('Maintenance/Requests/Index', [
            'requests' => $requests,
            'filters' => $request->only('status'),
        ]);
    }

    /**
     * Use Case A: พนักงานบันทึกคำขอแจ้งซ่อมใหม่
     */
    public function store(StoreMaintenanceRequestRequest $request): RedirectResponse
    {
        // ดึง ID ของ EmployeeProfile จาก User ที่ Login
        // (ต้องมีการตั้งค่า relation 'profile' ใน User Model ของ IAM)
        $employeeProfileId = $request->user()->profile->id;

        MaintenanceRequest::create([
            'asset_id' => $request->validated('asset_id'),
            'problem_description' => $request->validated('problem_description'),
            'requested_by_employee_id' => $employeeProfileId,
            'status' => MaintenanceRequest::STATUS_PENDING,
            'company_id' => $request->user()->company_id, // (สมมติว่า User มี company_id)
        ]);

        return redirect()->back()->with('success', 'ส่งคำขอแจ้งซ่อมสำเร็จ');
    }

    /**
     * Use Case A: Manager/Admin อนุมัติคำขอ และสร้าง Work Order อัตโนมัติ
     * (*** อัปเดต Logic ***)
     */
    public function approve(MaintenanceRequest $maintenanceRequest): RedirectResponse
    {
        if ($maintenanceRequest->status !== MaintenanceRequest::STATUS_PENDING) {
            return redirect()->back()->with('error', 'คำขอนี้ถูกดำเนินการไปแล้ว');
        }

        $correctiveType = MaintenanceType::where('code', 'CM')
            ->where('company_id', $maintenanceRequest->company_id) // (เพิ่มการกรอง company)
            ->first();

        if (!$correctiveType) {
            Log::error('ไม่พบ MaintenanceType "CM" ในระบบ');
            return redirect()->back()->with('error', 'เกิดข้อผิดพลาด: ไม่พบประเภทงานซ่อม');
        }

        try {
            DB::transaction(function () use ($maintenanceRequest, $correctiveType) {

                // 1. สร้าง Work Order ใหม่
                // (*** Logic ใหม่: เราใส่ maintenance_request_id ที่นี่ ***)
                $workOrder = WorkOrder::create([
                    'work_order_code' => $this->generateWorkOrderCode($maintenanceRequest->company_id),
                    'asset_id' => $maintenanceRequest->asset_id,
                    'maintenance_type_id' => $correctiveType->id,
                    'maintenance_request_id' => $maintenanceRequest->id, // (นี่คือ FK)
                    'status' => 'open', // (ใช้ string 'open' ตรงๆ)
                    'priority' => WorkOrder::PRIORITY_NORMAL, // (ใช้ Const ใหม่ P3)
                    'work_nature' => WorkOrder::NATURE_INTERNAL, // (ตั้งค่าเริ่มต้น)
                    'description' => $maintenanceRequest->problem_description,
                    'company_id' => $maintenanceRequest->company_id,
                ]);

                // 2. อัปเดต Maintenance Request
                // (*** Logic ใหม่: เราแค่เปลี่ยนสถานะ ไม่ต้องใส่ work_order_id ***)
                $maintenanceRequest->update([
                    'status' => MaintenanceRequest::STATUS_APPROVED,
                ]);
            });
        } catch (\Exception $e) {
            Log::error('การอนุมัติ MaintenanceRequest ล้มเหลว: ' . $e->getMessage());
            return redirect()->back()->with('error', 'การอนุมัติล้มเหลว');
        }

        return redirect()->back()->with('success', 'อนุมัติคำขอ และสร้างใบสั่งซ่อมเรียบร้อย');
    }

    /**
     * (ปรับปรุง) ฟังก์ชันช่วยสร้างรหัส Work Order (รับ company_id)
     */
    private function generateWorkOrderCode(int $companyId): string
    {
        // (ควรสร้าง Logic การ Running Number ตาม Company)
        $prefix = 'WO-' . $companyId . '-' . now()->format('Ym') . '-';
        // (ตัวอย่างชั่วคราว)
        $runningNumber = WorkOrder::where('company_id', $companyId)
            ->whereYear('created_at', now()->year)
            ->count() + 1;

        return $prefix . str_pad($runningNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Use Case A: Manager/Admin ปฏิเสธคำขอ
     */
    public function reject(Request $request, MaintenanceRequest $maintenanceRequest): RedirectResponse
    {
        // (ควรใช้ Policy)
        // $this->authorize('reject', $maintenanceRequest);

        if ($maintenanceRequest->status !== MaintenanceRequest::STATUS_PENDING) {
            return redirect()->back()->with('error', 'คำขอนี้ถูกดำเนินการไปแล้ว');
        }

        // (อาจจะเพิ่มการ validate 'rejection_reason' จาก $request)
        $maintenanceRequest->update([
            'status' => MaintenanceRequest::STATUS_REJECTED,
            // 'rejection_reason' => $request->input('reason'),
        ]);

        return redirect()->back()->with('success', 'ปฏิเสธคำขอเรียบร้อย');
    }
}
