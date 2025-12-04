<?php

namespace TmrEcosystem\Stock\Domain\Exceptions;

use Exception;

class InsufficientStockException extends Exception
{
    public static function forItem(string $itemUuid, float $requested, float $available): self
    {
        return new self("สินค้า (UUID: {$itemUuid}) คงเหลือไม่พอจอง (ต้องการ: {$requested}, คงเหลือ: {$available})");
    }
}
