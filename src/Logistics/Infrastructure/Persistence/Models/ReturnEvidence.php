<?php

namespace TmrEcosystem\Logistics\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ReturnEvidence extends Model
{
    protected $table = 'logistics_return_evidences';

    protected $fillable = [
        'return_note_id',
        'path',
        'description',
        'user_id'
    ];

    // Helper: สร้าง Full URL
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }
}
