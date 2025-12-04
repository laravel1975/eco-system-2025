<?php

namespace TmrEcosystem\Approval\Infrastructure\Database\Seeders;

use Illuminate\Database\Seeder;
use TmrEcosystem\Approval\Domain\Models\ApprovalWorkflow;
use TmrEcosystem\Approval\Domain\Models\ApprovalWorkflowStep;

class ApprovalSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedMaintenanceWorkflow();
        $this->seedLeaveRequestWorkflow();
    }

    /**
     * 🛠️ Scenario 1: ใบแจ้งซ่อม (Maintenance Work Order)
     * - Step 1: หัวหน้าช่าง (อนุมัติเสมอ)
     * - Step 2: ผู้จัดการโรงงาน (เฉพาะยอดเงิน > 5,000 บาท)
     */
    private function seedMaintenanceWorkflow(): void
    {
        $workflow = ApprovalWorkflow::create([
            'name' => 'Maintenance Work Order Flow',
            'code' => 'MAINTENANCE_WO_FLOW', // 🔥 จำ Code นี้ไว้ใช้ตอน SubmitRequest
            'description' => 'Standard approval flow for maintenance work orders.',
            'is_active' => true,
        ]);

        // Step 1: หัวหน้าแผนกซ่อมบำรุง (Maintenance Supervisor)
        ApprovalWorkflowStep::create([
            'workflow_id' => $workflow->id,
            'order' => 1,
            'approver_role' => 'MaintenanceSupervisor', // ต้องตรงกับ Role ในระบบ IAM/HRM
            'conditions' => null, // ไม่มีเงื่อนไข = ต้องผ่านทุกคน
        ]);

        // Step 2: ผู้จัดการโรงงาน (Plant Manager) - เฉพาะเคสแพงๆ
        ApprovalWorkflowStep::create([
            'workflow_id' => $workflow->id,
            'order' => 2,
            'approver_role' => 'PlantManager',
            'conditions' => [
                'estimated_cost' => [ // ชื่อ Field ที่จะส่งมาใน Payload
                    'operator' => '>',
                    'value' => 5000
                ]
            ],
        ]);
    }

    /**
     * 🏖️ Scenario 2: ใบลา (Leave Request)
     * - Step 1: หัวหน้างานโดยตรง (จบเลย)
     */
    private function seedLeaveRequestWorkflow(): void
    {
        $workflow = ApprovalWorkflow::create([
            'name' => 'General Leave Request',
            'code' => 'HR_LEAVE_FLOW',
            'description' => 'Simple 1-step approval for standard leave.',
            'is_active' => true,
        ]);

        ApprovalWorkflowStep::create([
            'workflow_id' => $workflow->id,
            'order' => 1,
            'approver_role' => 'LineManager',
            'conditions' => null,
        ]);
    }
}
