<?php

namespace TmrEcosystem\Communication\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use TmrEcosystem\IAM\Domain\Models\User;

class CommunicationMessage extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'communication_messages';

    protected $guarded = [];

    protected $casts = [
        'attachments' => 'array',
    ];

    // ความสัมพันธ์กลับไปหาเจ้าของเอกสาร (Order, Product, etc.)
    public function chatable(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'model_type', 'model_id');
    }

    // คนโพสต์
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
