<?php

namespace TmrEcosystem\Sales\Domain\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use TmrEcosystem\Sales\Domain\Aggregates\Order;

class OrderUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}
}
