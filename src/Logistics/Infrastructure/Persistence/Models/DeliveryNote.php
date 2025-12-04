<?php

namespace TmrEcosystem\Logistics\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use TmrEcosystem\Sales\Infrastructure\Persistence\Models\SalesOrderModel;

class DeliveryNote extends Model
{
    use HasUuids;

    protected $table = 'sales_delivery_notes';

    protected $guarded = [];

    protected $casts = [
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    // ความสัมพันธ์กลับไปหา Order
    public function order()
    {
        return $this->belongsTo(SalesOrderModel::class, 'order_id');
    }

    // ความสัมพันธ์กับ Picking Slip
    public function pickingSlip()
    {
        return $this->belongsTo(PickingSlip::class, 'picking_slip_id');
    }

    // ความสัมพันธ์กับ Shipment (Trip)
    public function shipment()
    {
        return $this->belongsTo(Shipment::class, 'shipment_id');
    }
}
