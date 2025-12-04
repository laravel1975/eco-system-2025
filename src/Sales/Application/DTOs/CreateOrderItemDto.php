<?php

namespace TmrEcosystem\Sales\Application\DTOs;

readonly class CreateOrderItemDto
{
    public function __construct(
        public string $productId,
        public int $quantity
    ) {}
}
