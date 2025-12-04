<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use TmrEcosystem\Maintenance\Domain\Models\MaintenancePlan;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTask;

class GeneratePmWorkOrders extends Command
{
    /**
     * ชื่อคำสั่งสำหรับเรียกใช้งาน (CLI)
     */
    protected $signature = 'maintenance:run-pm';

    /**
     * คำอธิบายคำสั่ง
     */
    protected $description = 'Generate Work Orders from active Maintenance Plans that are due.';

    /**
     * Logic การทำงานหลัก
     */
    public function handle()
    {
        $this->info('🚀 Starting PM Work Order generation...');

        // 1. ค้นหาแผน PM ที่ "Active" และ "ถึงกำหนดแล้ว" (รวมถึงวันที่ผ่านมาแล้วที่ยังไม่ได้สร้าง)
        // (Load tasks มาด้วยเพื่อความเร็ว)
        $plans = MaintenancePlan::query()
            ->where('status', 'active')
            // ความหมาย: ถ้าวันครบกำหนด อยู่ภายใน 7 วันนับจากวันนี้ -> ให้สร้าง WO เลย
            ->whereDate('next_due_date', '<=', now()->addDays(7))
            ->whereHas('asset', function ($q) {
                // (Optional) ตรวจสอบว่า Asset ต้องยัง Active อยู่ด้วย
                $q->where('status', 'active');
            })
            ->with(['tasks'])
            ->get();

        if ($plans->isEmpty()) {
            $this->info('No PM plans due today.');
            return;
        }

        $this->info("Found {$plans->count()} plans due.");
        $count = 0;

        foreach ($plans as $plan) {
            DB::beginTransaction();
            try {
                // 2. สร้าง Work Order ใหม่
                // (จำลองว่าเป็น User System หรือใช้ Auto-assigned)
                $wo = WorkOrder::create([
                    'company_id' => $plan->company_id,
                    'work_order_code' => $this->generateWoCode($plan->company_id),
                    'asset_id' => $plan->asset_id,
                    'maintenance_type_id' => $plan->maintenance_type_id,

                    // (ค่าเริ่มต้น)
                    'status' => 'open',
                    'priority' => WorkOrder::PRIORITY_NORMAL, // (P3)
                    'work_nature' => WorkOrder::NATURE_INTERNAL, // (Internal)

                    'description' => "[PM Auto] {$plan->title} (Due: {$plan->next_due_date->format('Y-m-d')})",

                    // (ในอนาคต: ถ้ามี Discipline ใน Plan ก็ใส่ตรงนี้)
                    // 'discipline_id' => $plan->discipline_id,
                ]);

                // 3. คัดลอก Checklist (PlanTasks -> WorkOrder Tasks)
                foreach ($plan->tasks as $planTask) {
                    MaintenanceTask::create([
                        'work_order_id' => $wo->id,
                        'task_name' => $planTask->task_name,
                        'description' => $planTask->description,
                        'sort_order' => $planTask->sort_order,
                        'is_checked' => false,
                    ]);
                }

                // 4. คำนวณและอัปเดต Next Due Date ของแผน
                $nextDate = Carbon::parse($plan->next_due_date);
                while ($nextDate->lte(now())) {
                    // (บวก interval ไปเรื่อยๆ จนกว่าจะเลยวันปัจจุบัน)
                    $nextDate->addDays($plan->interval_days);
                }

                // (บันทึกวันที่ใหม่ลง Database)
                $plan->update(['next_due_date' => $nextDate]);

                DB::commit();
                $count++;
                $this->info("✅ Generated WO: {$wo->work_order_code} for Plan: {$plan->title}");
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error("❌ Failed to generate WO for Plan ID {$plan->id}: " . $e->getMessage());
                Log::error("PM Generation Failed for Plan {$plan->id}", ['exception' => $e]);
            }
        }

        $this->info("🎉 Completed. Generated {$count} Work Orders.");
        Log::info("Maintenance Scheduler: Generated {$count} PM Work Orders.");
    }

    /**
     * Helper: สร้างรหัส WO (Logic เดียวกับ Controller)
     * (ในอนาคตควรย้าย Logic นี้ไปไว้ใน Service หรือ Trait กลาง)
     */
    private function generateWoCode(int $companyId): string
    {
        $prefix = 'WO-' . $companyId . '-' . now()->format('Ym') . '-';

        // (Lock เพื่อป้องกัน Race Condition ในเคสที่มีการสร้างพร้อมกันเยอะๆ)
        // (แต่สำหรับ Scheduler ที่รัน Process เดียว อาจไม่จำเป็นมากนัก)
        $runningNumber = WorkOrder::where('company_id', $companyId)
            ->whereYear('created_at', now()->year)
            ->count() + 1;

        return $prefix . str_pad($runningNumber, 4, '0', STR_PAD_LEFT);
    }
}
