<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use TmrEcosystem\Maintenance\Domain\Models\ActivityType;
use TmrEcosystem\Maintenance\Domain\Models\Asset;
use TmrEcosystem\Maintenance\Domain\Models\Contractor;
use TmrEcosystem\Maintenance\Domain\Models\FailureCode;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceAssignment;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTechnician;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceType;
use TmrEcosystem\Maintenance\Domain\Models\SparePart;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;
use TmrEcosystem\Maintenance\Presentation\Requests\CompleteWorkOrderRequest;
use TmrEcosystem\Maintenance\Presentation\Requests\StoreWorkOrderRequest;
use TmrEcosystem\Maintenance\Presentation\Requests\UpdateWorkOrderRequest;
use TmrEcosystem\Stock\Infrastructure\Persistence\Eloquent\Models\StockLevelModel;

class WorkOrderController extends Controller
{
    /**
     * (Feature D) แสดงรายการ Work Order ทั้งหมด
     * (*** อัปเดตใหม่ทั้งหมด ***)
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        // (1. เริ่ม Query)
        $query = WorkOrder::where('company_id', $companyId)
            ->with(['asset:id,name', 'maintenanceType:id,name']); // (ดึงข้อมูลที่จำเป็น)

        // (2. Filter)
        // (Filter: Search)
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('work_order_code', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhereHas('asset', function ($assetQuery) use ($request) {
                        $assetQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // (Filter: Status)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // (Filter: Priority)
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // (Filter: Type)
        if ($request->filled('maintenance_type_id')) {
            $query->where('maintenance_type_id', $request->maintenance_type_id);
        }

        // (3. Paginate)
        $workOrders = $query->latest()->paginate(15)
            ->withQueryString(); // (เพื่อให้ link pagination จำ filter ได้)

        // (4. ดึงข้อมูลสำหรับ Dropdown Filter)
        $maintenanceTypes = MaintenanceType::where('company_id', $companyId)
            ->get(['id', 'name']);

        // (5. ส่งข้อมูลไปให้ React)
        return inertia('Maintenance/WorkOrders/Index', [
            'workOrders' => $workOrders,
            'maintenanceTypes' => $maintenanceTypes,
            'filters' => $request->only(['search', 'status', 'priority', 'maintenance_type_id']),
        ]);
    }

    /**
     * (Feature D) แสดงหน้ารายละเอียด Work Order (หน้าหลักสำหรับจัดการ)
     * (*** Refactored for Pure DDD Integration ***)
     */
    public function show(WorkOrder $workOrder)
    {
        // $this->authorize('view', $workOrder);
        $companyId = $workOrder->company_id;

        // (1. โหลด Relations ภายใน Maintenance BC - เหมือนเดิม)
        $workOrder->load([
            'maintenanceType',
            'maintenanceRequest.requester',
            'asset',
            'assignments.assignable',
            'sparePartsUsed.sparePart', // (Relation จาก WorkOrderSparePart.php)
            'attachments',
            'tasks'
        ]);

        // (2. ดึงข้อมูลสำหรับ Pager, Dropdowns - เหมือนเดิม)
        $query = WorkOrder::where('company_id', $companyId)->orderBy('id', 'asc');
        // ... (Logic Pager) ...
        $allWorkOrderIds = $query->pluck('id')->all();
        $currentIndex = array_search($workOrder->id, $allWorkOrderIds);
        $total = count($allWorkOrderIds);
        $nextId = $allWorkOrderIds[$currentIndex + 1] ?? null;
        $prevId = $allWorkOrderIds[$currentIndex - 1] ?? null;

        $availableTechnicians = MaintenanceTechnician::where('company_id', $companyId)
            ->get(['employee_profile_id as id', 'first_name', 'last_name']);
        $availableContractors = Contractor::where('company_id', $companyId)
            ->get(['id', 'name']);
        $failureCodes = FailureCode::where('company_id', $workOrder->company_id)
            ->get(['id', 'name', 'code', 'parent_id']);
        $activityTypes = ActivityType::where('company_id', $workOrder->company_id)
            ->get(['id', 'name', 'code']);

        // (3. ▼▼▼ [แก้ไข] Logic ดึงอะไหล่ (Available Spare Parts) ▼▼▼)
        $availableSpareParts = [];

        // (3a. หาคลังของ Asset นี้)
        $asset = $workOrder->asset;
        $warehouseUuid = $asset ? $asset->warehouse_uuid : null;

        if ($warehouseUuid) {
            // (3b. (Query Stock BC) หายอดสต็อกที่ "ใช้ได้" (Available) ณ คลังนี้)
            // (เราดึงจาก "ความจริง" (Source of Truth))
            $availableStockLevels = StockLevelModel::where('warehouse_uuid', $warehouseUuid)
                ->where('company_id', $companyId)
                // (เราควรเช็ก 'Available' (On Hand - Reserved) แต่เพื่อความง่าย เราใช้ On Hand ก่อน)
                ->where('quantity_on_hand', '>', 0)
                ->pluck('quantity_on_hand', 'item_uuid'); // (สร้าง Map [item_uuid => 10.00])

            if ($availableStockLevels->isNotEmpty()) {
                // (3c. (Query Maintenance BC) ดึงข้อมูล SparePart (Master) เฉพาะที่มีสต็อก)
                $spareParts = SparePart::where('company_id', $companyId)
                    ->whereIn('item_uuid', $availableStockLevels->keys())
                    ->get(['id', 'name', 'part_number', 'item_uuid']);

                // (3d. (Map) ประกอบร่าง DTO สำหรับ Frontend)
                $availableSpareParts = $spareParts->map(function ($sp) use ($availableStockLevels) {
                    return [
                        'id' => $sp->id,
                        'name' => $sp->name,
                        'part_number' => $sp->part_number,
                        // (ส่งยอด "จริง" จาก Stock BC ไป)
                        'stock_quantity' => $availableStockLevels[$sp->item_uuid] ?? 0,
                    ];
                })->values(); // (Reset keys)
            }
        }
        // (3. ▲▲▲ [สิ้นสุด] Logic ดึงอะไหล่ (Available Spare Parts) ▲▲▲)


        // (4. ส่ง Props ทั้งหมดไปให้ React)
        return inertia('Maintenance/WorkOrders/Show', [
            'workOrder' => $workOrder,
            'availableTechnicians' => $availableTechnicians,
            'availableContractors' => $availableContractors,
            'availableSpareParts' => $availableSpareParts, // (นี่คือข้อมูลใหม่ที่ถูกต้อง)
            'failureCodes' => $failureCodes,
            'activityTypes' => $activityTypes,
            'paginationInfo' => [
                'current_index' => $currentIndex + 1,
                'total' => $total,
                'next_wo_id' => $nextId,
                'prev_wo_id' => $prevId,
            ],
        ]);
    }

    /**
     * (Feature D) แสดงฟอร์มสร้าง Work Order
     * (*** อัปเดตใหม่ ***)
     */
    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;

        // (1. ดึงข้อมูลสำหรับ Dropdown)
        $assets = Asset::where('company_id', $companyId)
            ->where('status', 'active') // (ดึงเฉพาะ Asset ที่ใช้งานอยู่)
            ->get(['id', 'name', 'asset_code', 'location']);

        $types = MaintenanceType::where('company_id', $companyId)
            ->get(['id', 'name']);

        // (2. ส่งข้อมูลไปให้ React)
        return inertia('Maintenance/WorkOrders/Create', [
            'assets' => $assets,
            'maintenanceTypes' => $types,
        ]);
    }

    /**
     * (Feature D) บันทึก Work Order ที่สร้างใหม่
     * (*** อัปเดตใหม่ ***)
     */
    public function store(StoreWorkOrderRequest $request): RedirectResponse
    {
        $companyId = $request->user()->company_id;

        // (1. ใช้ Helper ที่เราเคยสร้างไว้)
        $workOrder = WorkOrder::create($request->validated() + [
            'company_id' => $companyId,
            'status' => 'open', // (ใช้ string 'open' แทน Const)
            'work_order_code' => $this->generateWorkOrderCode($companyId),
        ]);

        // (2. [สำคัญ] Redirect ไปหน้า Show ของ WO ที่เพิ่งสร้าง)
        return redirect()->route('maintenance.work-orders.show', $workOrder)
            ->with('success', 'สร้างใบสั่งซ่อมเรียบร้อย');
    }

    /**
     * (Feature D) แสดงฟอร์มแก้ไข Work Order
     */
    public function edit(Request $request, WorkOrder $workOrder)
    {
        // (Logic คล้าย create() แต่ส่ง $workOrder ไปด้วย)
    }

    /**
     * (Feature D) อัปเดตข้อมูล Work Order
     */
    public function update(UpdateWorkOrderRequest $request, WorkOrder $workOrder): RedirectResponse
    {
        // $this->authorize('update', $workOrder);

        $workOrder->update($request->validated());

        return redirect()->route('maintenance.work-orders.show', $workOrder)
            ->with('success', 'อัปเดตใบสั่งซ่อมเรียบร้อย');
    }

    // --- ⬇️ (ส่วนของ Workflow Management) ⬇️ ---

    /**
     * (Workflow) ช่างเริ่มงาน
     */
    public function startWork(WorkOrder $workOrder): RedirectResponse // (1. ตัวแปรที่ถูกต้องคือ $workOrder)
    {
        // (2. ตรวจสอบว่าคุณใช้ $workOrder (มี r) ไม่ใช่ $workOrde)
        if ($workOrder->status !== 'assigned') {
            return redirect()->back()->with('error', 'ไม่สามารถเริ่มงานได้ (สถานะไม่ถูกต้อง)');
        }

        // (3. ตรวจสอบว่าคุณใช้ $workOrder (มี r) ที่นี่ด้วย)
        $workOrder->update(['status' => 'in_progress']);

        return redirect()->back()->with('success', 'เริ่มงานซ่อม');
    }

    /**
     * (Workflow) ช่างทำงานเสร็จ (รอปิดงาน)
     * (*** อัปเกรด: เพิ่ม Logic Snapshot Cost ***)
     */
    public function completeWork(CompleteWorkOrderRequest $request, WorkOrder $workOrder): RedirectResponse
    {
        if ($workOrder->status !== 'in_progress') {
            return redirect()->back()->with('error', 'ไม่สามารถปิดงานได้ (สถานะไม่ถูกต้อง)');
        }

        try {
            DB::beginTransaction();

            // (1. อัปเดต WO หลัก - เหมือนเดิม)
            $workOrder->update([
                'status' => 'completed',
                'failure_code_id' => $request->validated('failure_code_id'),
                'activity_type_id' => $request->validated('activity_type_id'),
                'downtime_hours' => $request->validated('downtime_hours'),
            ]);

            // (2. [อัปเกรด] วนลูปอัปเดต Labor Hours และคำนวณ Cost)
            foreach ($request->validated('assignments') as $assignmentData) {

                // (ดึง Assignment พร้อมกับข้อมูล Technician/Contractor)
                $assignment = MaintenanceAssignment::with('assignable')
                    ->where('id', $assignmentData['id'])
                    ->where('work_order_id', $workOrder->id)
                    ->first();

                if ($assignment) {
                    $hours = $assignmentData['hours'];
                    $hourlyRate = 0;

                    // (ตรวจสอบว่าเป็นช่างภายในหรือไม่)
                    if ($assignment->assignable_type === \TmrEcosystem\Maintenance\Domain\Models\MaintenanceTechnician::class) {
                        // (ดึงค่าแรงปัจจุบันจาก Master Data)
                        $hourlyRate = $assignment->assignable->hourly_rate ?? 0;
                    }
                    // (ถ้าเป็น Contractor เราอาจจะใส่ 0 หรือ Logic อื่นในอนาคต)

                    // (คำนวณต้นทุน)
                    $totalCost = $hours * $hourlyRate;

                    // (บันทึก Snapshot ลง DB)
                    $assignment->update([
                        'actual_labor_hours' => $hours,
                        'recorded_hourly_rate' => $hourlyRate, // (Snapshot!)
                        'labor_cost' => $totalCost // (Snapshot!)
                    ]);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Complete Work Failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'การบันทึกข้อมูลล้มเหลว');
        }

        return redirect()->back()->with('success', 'งานซ่อมเสร็จสิ้น (บันทึกข้อมูลและต้นทุนเรียบร้อย)');
    }

    /**
     * (Workflow) Manager ปิดงาน (เสร็จสมบูรณ์)
     */
    public function closeWork(WorkOrder $workOrder): RedirectResponse
    {
        if ($workOrder->status !== 'completed') { // (ใช้ string 'completed')
            return redirect()->back()->with('error', 'ไม่สามารถปิดงานได้ (สถานะไม่ถูกต้อง)');
        }

        $workOrder->update(['status' => 'closed']); // (ใช้ string 'closed')
        return redirect()->back()->with('success', 'ปิดงานซ่อมเรียบร้อย');
    }

    /**
     * (Helper) ฟังก์ชันสร้างรหัส Work Order
     */
    private function generateWorkOrderCode(int $companyId): string
    {
        $prefix = 'WO-' . $companyId . '-' . now()->format('Ym') . '-';
        $runningNumber = WorkOrder::where('company_id', $companyId)
            ->whereYear('created_at', now()->year)
            ->count() + 1;

        return $prefix . str_pad($runningNumber, 4, '0', STR_PAD_LEFT);
    }
}
