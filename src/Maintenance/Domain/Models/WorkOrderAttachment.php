<?php

namespace TmrEcosystem\Maintenance\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use TmrEcosystem\IAM\Domain\Models\User; // (เชื่อมไป IAM)

class WorkOrderAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_order_id',
        'file_path',
        'file_name',
        'description',
        'uploaded_by_user_id',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * ความสัมพันธ์: ผู้อัปโหลดไฟล์ (User)
     */
    public function uploader(): BelongsTo
    {
        // (เชื่อมโยงไปยัง Bounded Context ของ IAM)
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }
}
