<?php

namespace TmrEcosystem\Approval\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use TmrEcosystem\Approval\Domain\Enums\ApprovalStatus;
use TmrEcosystem\IAM\Domain\Models\User;

class ApprovalRequest extends Model
{
    use HasUuids;

    protected $guarded = [];
    protected $casts = [
        'status' => ApprovalStatus::class,
    ];

    // 2. แก้ไขชื่อ Class ในความสัมพันธ์
    public function workflow()
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }

    public function actions()
    {
        return $this->hasMany(ApprovalAction::class, 'approval_request_id')->latest();
    }

    public function currentStep()
    {
        return $this->hasOne(ApprovalWorkflowStep::class, 'workflow_id', 'workflow_id')
            ->where('order', $this->current_step_order);
    }

    /**
     * เชื่อมโยงกับ User ผู้ขออนุมัติ
     */
    public function requester()
    {
        // สมมติว่า User Model อยู่ที่ namespace นี้ (ปรับตามจริงถ้าต่างกัน)
        return $this->belongsTo(User::class, 'requester_id');
    }
}
