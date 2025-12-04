<?php

namespace TmrEcosystem\Stock\Domain\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * นี่คือ Event ที่ "ประกาศ" ว่า StockLevel ของ Item นี้
 * มีการเปลี่ยนแปลงยอดคงเหลือ (On Hand)
 */
class StockLevelUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param string $itemUuid UUID ของ Item ที่ถูกอัปเดต
     * @param string $companyId ID ของบริษัท
     */
    public function __construct(
        public string $itemUuid,
        public string $companyId
    ) {
    }
}
