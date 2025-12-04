<?php

namespace TmrEcosystem\Approval\Application\UseCases;

use TmrEcosystem\Approval\Domain\Models\ApprovalRequest;
use TmrEcosystem\Approval\Domain\Enums\ApprovalStatus;
use TmrEcosystem\Approval\Domain\Events\WorkflowCompleted;
use TmrEcosystem\Approval\Domain\Services\ConditionChecker;
use Illuminate\Support\Facades\DB;
use Exception;

class ApproveRequestUseCase
{
    public function __construct(
        protected ConditionChecker $conditionChecker
    ) {}

    public function handle(string $requestId, int|string $actorId, ?string $comment = null)
    {
        return DB::transaction(function () use ($requestId, $actorId, $comment) {
            $request = ApprovalRequest::lockForUpdate()->findOrFail($requestId);

            // TODO: (Phase ถัดไป) เช็คว่า $actorId มีสิทธิ์อนุมัติใน Step ปัจจุบันหรือไม่?

            // 1. บันทึก Action Log
            $request->actions()->create([
                'actor_id' => $actorId,
                'action' => 'approve',
                'comment' => $comment
            ]);

            // 2. คำนวณหา Step ถัดไป
            $nextStep = $this->findNextStep($request);

            if ($nextStep) {
                // ยังไม่จบ -> ไป Step ถัดไป
                $request->update([
                    'current_step_order' => $nextStep->order,
                    'status' => ApprovalStatus::PENDING
                ]);

                // Tip: ตรงนี้สามารถ Fire Event "NewApproverAssigned" เพื่อแจ้งเตือนคนต่อไปได้
            } else {
                // จบ Flow แล้ว -> Approved สมบูรณ์
                $request->update([
                    'status' => ApprovalStatus::APPROVED
                ]);

                // 🔥 แจ้ง Module อื่นว่าจบงานแล้ว
                WorkflowCompleted::dispatch($request);
            }

            return $request;
        });
    }

    /**
     * ค้นหา Step ถัดไปที่ตรงเงื่อนไข (ข้าม Step ที่ไม่เข้าเงื่อนไขอัตโนมัติ)
     */
    private function findNextStep(ApprovalRequest $request)
    {
        // ดึง Step ทั้งหมดที่อยู่หลังจาก Step ปัจจุบัน
        $subsequentSteps = $request->workflow->steps()
            ->where('order', '>', $request->current_step_order)
            ->orderBy('order')
            ->get();

        // payload สมมติ (ของจริงต้องดึงจาก Snapshot หรือ query จาก subject)
        $payload = []; // TODO: Implement fetching payload from Subject (Polymorphic)

        foreach ($subsequentSteps as $step) {
            // เช็คเงื่อนไข ถ้าผ่านเงื่อนไข ให้หยุดที่ Step นี้
            if ($this->conditionChecker->check($step->conditions, $payload)) {
                return $step;
            }
            // ถ้าไม่ผ่านเงื่อนไข Loop จะวิ่งต่อ (แปลว่า Skip Step นี้ไปเลย)
        }

        return null; // ไม่เหลือ Step แล้ว
    }
}
