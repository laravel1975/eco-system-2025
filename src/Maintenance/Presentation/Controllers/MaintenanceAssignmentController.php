<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile; // (ดึงจาก HRM)
use TmrEcosystem\Maintenance\Domain\Models\Contractor;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceAssignment;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTechnician;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;

class MaintenanceAssignmentController extends Controller
{
    /**
     * (Feature D) มอบหมายช่าง (Employee) ให้กับ Work Order
     */
    public function store(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        // $this->authorize('assign', $workOrder);
        $companyId = $workOrder->company_id;

        $validated = $request->validate([
            'employee_id' => [
                'required',
                // (ตรวจสอบว่า Employee อยู่ในบริษัทเดียวกัน)
                Rule::exists('employee_profiles', 'id')->where('company_id', $companyId)
            ],
            // 'estimated_hours' => 'nullable|numeric|min:0.5'
        ]);

        // (ป้องกันการมอบหมายซ้ำ)
        $exists = MaintenanceAssignment::where('work_order_id', $workOrder->id)
            ->where('employee_id', $validated['employee_id'])
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'ช่างคนนี้ถูกมอบหมายแล้ว');
        }

        // 1. สร้าง Assignment
        MaintenanceAssignment::create([
            'work_order_id' => $workOrder->id,
            'employee_id' => $validated['employee_id'],
            // 'estimated_hours' => $validated['estimated_hours'] ?? null,
        ]);

        // 2. (Workflow) อัปเดตสถานะ Work Order ถ้ายังเป็น 'Open'
        if ($workOrder->status === WorkOrder::STATUS_OPEN) {
            $workOrder->update(['status' => WorkOrder::STATUS_ASSIGNED]);
        }

        return redirect()->back()->with('success', 'มอบหมายงานให้ช่างเรียบร้อย');
    }

    /**
     * (Feature D) มอบหมาย "ช่างภายใน" (Technician)
     * (*** อัปเกรดใหม่ทั้งหมด ***)
     */
    public function storeTechnician(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        $companyId = $workOrder->company_id;

        $validated = $request->validate([
            'employee_id' => [ // (เรายังรับ employee_id จากฟอร์ม)
                'required',
                // (3. [แก้ไข] ตรวจสอบว่า ID นี้มีอยู่ใน "สำเนา" ของเรา)
                Rule::exists('maintenance_technicians', 'employee_profile_id')
                    ->where('company_id', $companyId),
            ],
        ]);

        $assignableId = $validated['employee_id'];

        $assignableType = MaintenanceTechnician::class; // (4. [แก้ไข] ใช้ Model ของ Maintenance)

        // (5. [แก้ไข] ตรวจสอบการมอบหมายซ้ำ)
        $exists = MaintenanceAssignment::where('work_order_id', $workOrder->id)
            ->where('assignable_type', $assignableType)
            ->where('assignable_id', $assignableId)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'ช่างคนนี้ถูกมอบหมายแล้ว');
        }

        // 6. [แก้ไข] สร้าง Assignment
        MaintenanceAssignment::create([
            'work_order_id' => $workOrder->id,
            'assignable_type' => $assignableType,
            'assignable_id' => $assignableId,
        ]);

        $this->updateWorkOrderOnAssignment($workOrder);
        return redirect()->back()->with('success', 'มอบหมายงานให้ช่างเรียบร้อย');
    }

    /**
     * (Feature D) มอบหมาย "ผู้รับเหมา" (Contractor) ให้กับ Work Order
     * (*** เพิ่มใหม่ทั้งหมด ***)
     */
    public function storeContractor(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        // $this->authorize('assign', $workOrder);
        $companyId = $workOrder->company_id;

        $validated = $request->validate([
            'contractor_id' => [
                'required',
                Rule::exists('contractors', 'id')->where('company_id', $companyId)
            ],
        ]);

        $assignableId = $validated['contractor_id'];
        $assignableType = Contractor::class; // (ระบุ Type)

        // (ตรวจสอบการมอบหมายซ้ำ)
        $exists = MaintenanceAssignment::where('work_order_id', $workOrder->id)
            ->where('assignable_type', $assignableType)
            ->where('assignable_id', $assignableId)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'ผู้รับเหมารายนี้ถูกมอบหมายแล้ว');
        }

        // (สร้าง Assignment)
        MaintenanceAssignment::create([
            'work_order_id' => $workOrder->id,
            'assignable_type' => $assignableType,
            'assignable_id' => $assignableId,
        ]);

        // (อัปเดตสถานะ Work Order)
        $this->updateWorkOrderOnAssignment($workOrder);

        return redirect()->back()->with('success', 'มอบหมายงานให้ผู้รับเหมาเรียบร้อย');
    }

    /**
     * (Feature D) ลบผู้รับผิดชอบ (Technician หรือ Contractor) ออกจาก Work Order
     * (*** อัปเกรดใหม่ ***)
     */
    public function destroy(WorkOrder $workOrder, MaintenanceAssignment $assignment): RedirectResponse
    {
        // $this->authorize('unassign', $workOrder);

        if ($assignment->work_order_id !== $workOrder->id) {
            abort(404);
        }

        $assignment->delete();

        // (ถ้าไม่เหลือช่างเลย อาจจะต้องเปลี่ยนสถานะกลับเป็น 'Open')
        if ($workOrder->assignments()->count() === 0) {
            // (7. [แก้ไข] อัปเดตสถานะ + Work Nature)
            $workOrder->update([
                'status' => 'open', // (ใช้ string 'open')
                'work_nature' => WorkOrder::NATURE_INTERNAL, // (Reset กลับเป็น Internal)
            ]);
        }

        return redirect()->back()->with('success', 'ยกเลิกการมอบหมาย');
    }

    /**
     * (Helper) อัปเดต Work Nature
     * (*** อัปเกรดใหม่ ***)
     */
    private function updateWorkOrderOnAssignment(WorkOrder $workOrder)
    {
        if ($workOrder->status === 'open') {
            $workOrder->status = 'assigned';
        }

        // (7. [แก้ไข] อัปเดต Work Nature)
        $hasInternal = $workOrder->assignments()->where('assignable_type', MaintenanceTechnician::class)->exists();
        $hasExternal = $workOrder->assignments()->where('assignable_type', Contractor::class)->exists();

        if ($hasInternal && $hasExternal) {
            $workOrder->work_nature = WorkOrder::NATURE_MIXED;
        } elseif ($hasExternal) {
            $workOrder->work_nature = WorkOrder::NATURE_EXTERNAL;
        } else {
            $workOrder->work_nature = WorkOrder::NATURE_INTERNAL;
        }

        $workOrder->save();
    }
}
