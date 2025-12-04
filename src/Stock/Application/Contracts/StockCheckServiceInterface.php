<?php

namespace TmrEcosystem\Stock\Application\Contracts;

interface StockCheckServiceInterface
{
    // ... (เมธอดเดิม checkAvailability, checkAvailabilityBatch) ...

    public function checkAvailability(string $partNumber, string $warehouseId): float;
    public function checkAvailabilityBatch(array $partNumbers, string $warehouseId): array;

    /**
     * ✅ ดึงข้อมูลสรุปสต็อก (On Hand, Reserved, Incoming)
     * @return array { on_hand: float, outgoing: float, incoming: float }
     */
    public function getStockSummary(string $itemUuid, string $companyId): array;
}
