<?php

namespace TmrEcosystem\Logistics\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\DeliveryNote; // ถ้ามี

class Shipment extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'logistics_shipments';
    protected $guarded = [];

    protected $casts = [
        'planned_date' => 'datetime',
        'departed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    // ✅ เพิ่มความสัมพันธ์นี้
    public function deliveryNotes()
    {
        // shipment_id คือ FK ในตาราง sales_delivery_notes
        return $this->hasMany(DeliveryNote::class, 'shipment_id');
    }
}
