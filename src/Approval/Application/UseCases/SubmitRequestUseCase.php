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
        string $subjectId,
        int|string $requesterId,
        array $payload = []
    ): ApprovalRequest {

        $workflow = ApprovalWorkflow::where('code', $workflowCode)
            ->where('is_active', true)
            ->first();

        if (!$workflow) {
            throw new Exception("Workflow definition '{$workflowCode}' not found or inactive.");
        }

        // ✅ แก้ไขตรงนี้: เพิ่ม payload_snapshot ลงไปใน array create
        $request = ApprovalRequest::create([
            'workflow_id' => $workflow->id,
            'requester_id' => $requesterId,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'status' => 'pending',
            'current_step_order' => 1,
            'payload_snapshot' => $payload, // <--- บันทึก Payload จริงลง DB
        ]);

        return $request;
    }
}
