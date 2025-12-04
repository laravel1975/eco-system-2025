<?php

namespace TmrEcosystem\Inventory\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Value Object สำหรับจัดการค่าเงิน/ต้นทุน
 */
final readonly class Money
{
    public function __construct(private float $amount)
    {
        if ($amount < 0) {
            throw new InvalidArgumentException("Money/Cost cannot be negative.");
        }
    }

    public function amount(): float
    {
        return $this->amount; // <-- (แก้ไข) จาก $this.amount
    }

    // Helper สำหรับการแสดงผลหรือคำนวณ
    public function add(Money $other): self {
        return new self($this->amount + $other->amount());
    }
}
