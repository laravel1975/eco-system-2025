<?php

namespace TmrEcosystem\Approval\Application\UseCases;

use TmrEcosystem\Approval\Domain\Models\ApprovalRequest;
use TmrEcosystem\Approval\Domain\Models\ApprovalWorkflow;
use Exception;

class SubmitRequestUseCase
{
    public function handle(
        string $workflowCode,
        string $subjectType,
        string $subjectId, // รับเป็น String เพื่อรองรับ UUID
        int|string $requesterId, // รับเป็น String ได้เผื่อ User UUID
        array $payload = [] // ข้อมูลสำหรับเช็คเงื่อนไข เช่น amount, department
    ): ApprovalRequest {

        // 1. หา Workflow Template ที่ Active อยู่
        $workflow = ApprovalWorkflow::where('code', $workflowCode)
            ->where('is_active', true)
            ->first();

        if (!$workflow) {
            throw new Exception("Workflow definition '{$workflowCode}' not found or inactive.");
        }

        // 2. สร้าง Request ใหม่
        // หมายเหตุ: current_step_order เริ่มที่ 1 เสมอ (หรือจะเขียน Logic ข้าม Step แรกที่นี่ก็ได้)
        $request = ApprovalRequest::create([
            'workflow_id' => $workflow->id,
            'requester_id' => $requesterId,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'status' => 'pending',
            'current_step_order' => 1,
            // ในอนาคตคุณอาจเพิ่ม field 'payload_snapshot' ใน migration เพื่อเก็บ $payload ไว้ดูย้อนหลัง
        ]);

        return $request;
    }
}
