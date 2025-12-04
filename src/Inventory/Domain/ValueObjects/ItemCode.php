<?php

namespace TmrEcosystem\Inventory\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Value Object สำหรับ Part Number (Item Code)
 */
final readonly class ItemCode
{
    private string $value;

    public function __construct(string $value)
    {
        if (empty(trim($value))) {
            throw new InvalidArgumentException('Item Code (Part Number) cannot be empty.');
        }

        // (คุณสามารถเพิ่มกฎ Validation อื่นๆ ที่นี่ได้ เช่น format)

        $this->value = trim($value); // <-- (แก้ไข) จาก $this.value
    }

    public function value(): string
    {
        return $this->value; // <-- (แก้ไข) จาก $this.value
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value(); // <-- (แก้ไข) จาก $this.value
    }
}
