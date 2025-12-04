<?php

namespace TmrEcosystem\Approval\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalWorkflowStep extends Model
{
    protected $table = 'approval_workflow_steps';

    protected $guarded = [];

    protected $casts = [
        'conditions' => 'array', // แปลง JSON ใน Database เป็น Array อัตโนมัติ
        'order' => 'integer',
    ];

    /**
     * เชื่อมกลับไปยัง Workflow หลัก
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }
}
