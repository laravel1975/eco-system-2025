<?php

namespace TmrEcosystem\Sales\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesOrderItemModel extends Model
{
    protected $table = 'sales_order_items';

    protected $guarded = [];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(SalesOrderModel::class, 'order_id');
    }
}
