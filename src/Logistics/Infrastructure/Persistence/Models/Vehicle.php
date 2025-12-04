<?php

namespace TmrEcosystem\Logistics\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Vehicle extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'logistics_vehicles';
    protected $guarded = [];

    // ความสัมพันธ์กับ Shipment
    public function shipments()
    {
        return $this->hasMany(Shipment::class, 'vehicle_id');
    }
}
