<?php

namespace TmrEcosystem\Logistics\Domain\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\DeliveryNote;

class DeliveryNoteCancelled
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public DeliveryNote $deliveryNote
    ) {}
}
