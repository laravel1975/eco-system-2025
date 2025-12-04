<?php

namespace TmrEcosystem\Stock\Application\DTOs;

readonly class TransferStockData
{
    public function __construct(
        public string $companyId,
        public string $itemUuid,
        public string $warehouseUuid,
        public string $fromLocationUuid,
        public string $toLocationUuid,
        public float $quantity,
        public ?string $userId = null,
        public ?string $reason = null
    ) {}
}
