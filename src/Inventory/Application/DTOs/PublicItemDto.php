<?php

namespace TmrEcosystem\Inventory\Application\DTOs;

readonly class PublicItemDto
{
    public function __construct(
        public string $uuid,
        public string $partNumber,
        public string $name,
        public float $price, // หรือ averageCost แล้วแต่ตกลง
        public string $uom,
        public ?string $imageUrl = null
    ) {}
}
