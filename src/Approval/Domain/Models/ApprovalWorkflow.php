<?php

namespace TmrEcosystem\Approval\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalWorkflow extends Model
{
    protected $table = 'approval_workflows';

    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * ดึงขั้นตอนทั้งหมดของ Workflow นี้ (เรียงตามลำดับ Order)
     */
    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalWorkflowStep::class, 'workflow_id')->orderBy('order');
    }

    /**
     * ดึงรายการคำขอทั้งหมดที่ใช้ Workflow นี้
     */
    public function requests(): HasMany
    {
        return $this->hasMany(ApprovalRequest::class, 'workflow_id');
    }
}
