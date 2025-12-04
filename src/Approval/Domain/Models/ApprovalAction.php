<?php

namespace TmrEcosystem\Approval\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use TmrEcosystem\IAM\Domain\Models\User; // ดึง User Model จาก IAM Context

class ApprovalAction extends Model
{
    protected $table = 'approval_actions';

    protected $guarded = [];

    protected $casts = [
        'action_date' => 'datetime',
    ];

    /**
     * เชื่อมกลับไปยังคำขออนุมัติ
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(ApprovalRequest::class, 'approval_request_id');
    }

    /**
     * ผู้ที่กระทำการ (User)
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
