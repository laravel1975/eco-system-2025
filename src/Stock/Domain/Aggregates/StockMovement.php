<?php

namespace TmrEcosystem\Stock\Domain\Aggregates;

use Exception;

/**
 * นี่คือ POPO ที่บันทึกประวัติการเคลื่อนไหว
 * โดยทั่วไปถือเป็น Immutable (สร้างแล้วห้ามแก้)
 */
class StockMovement
{
    /**
     * @param string $uuid
     * @param string $stockLevelUuid
     * @param string|null $userId
     * @param string $type (RECEIPT, ISSUE, TRANSFER, ADJUST)
     * @param float $quantityChange
     * @param float $quantityAfterMove
     * @param string|null $reference
     */
    public function __construct(
        private string $uuid,
        private string $stockLevelUuid,
        private ?string $userId,
        private string $type,
        private float $quantityChange,
        private float $quantityAfterMove,
        private ?string $reference
    ) {
        if ($quantityChange == 0) {
            throw new Exception("Quantity change cannot be zero.");
        }
    }

    /**
     * Factory Method (สร้างจาก Logic ของ StockLevel)
     */
    public static function create(
        string $stockLevelUuid,
        ?string $userId,
        string $type,
        float $quantityChange,
        float $quantityAfterMove,
        ?string $reference
    ): self {
        return new self(
            uuid: (string) \Illuminate\Support\Str::uuid(), // (สร้าง UUID ที่นี่)
            stockLevelUuid: $stockLevelUuid,
            userId: $userId,
            type: $type,
            quantityChange: $quantityChange,
            quantityAfterMove: $quantityAfterMove,
            reference: $reference
        );
    }
}
