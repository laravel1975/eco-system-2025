<?php

namespace TmrEcosystem\HRM\Domain\Models;

use App\Models\Company;
use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'date',
        'is_recurring',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'is_recurring' => 'boolean',
    ];

    // (ใช้ Global Scope)
    protected static function booted(): void
    {
        static::addGlobalScope(new CompanyScope);
    }

    // --- Relationships ---

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
