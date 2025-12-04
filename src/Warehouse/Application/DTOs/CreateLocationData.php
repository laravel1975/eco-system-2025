<?php

namespace TmrEcosystem\Warehouse\Application\DTOs;

readonly class CreateLocationData
{
    public function __construct(
        public string $warehouseUuid,
        public string $code,
        public ?string $barcode = null,
        public string $type = 'PICKING',
        public ?string $description = null
    ) {}
}
