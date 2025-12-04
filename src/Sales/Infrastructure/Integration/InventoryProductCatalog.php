<?php

namespace TmrEcosystem\Sales\Infrastructure\Integration;

use TmrEcosystem\Sales\Domain\Services\ProductCatalogInterface;
use TmrEcosystem\Sales\Domain\Services\ProductData;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;
use TmrEcosystem\Stock\Application\Contracts\StockCheckServiceInterface; // (ถ้ามีใช้ Stock)

class InventoryProductCatalog implements ProductCatalogInterface
{
    public function __construct(
        private ItemLookupServiceInterface $inventoryService
        // private StockCheckServiceInterface $stockService
    ) {}

    public function findProduct(string $productId): ?ProductData
    {
        $dto = $this->inventoryService->findByPartNumber($productId);
        if (!$dto) return null;

        return new ProductData(
            id: $dto->partNumber,
            name: $dto->name,
            price: $dto->price,
            stockAvailable: 999, // (หรือเรียก Stock Service)
            imageUrl: $dto->imageUrl // ✅ Map รูปภาพ
        );
    }

    public function getProductsByIds(array $productIds): array
    {
        $dtos = $this->inventoryService->getByPartNumbers($productIds);
        $result = [];
        foreach ($dtos as $partNumber => $dto) {
            $result[$partNumber] = new ProductData(
                id: $dto->partNumber,
                name: $dto->name,
                price: $dto->price,
                stockAvailable: 999,
                imageUrl: $dto->imageUrl // ✅ Map รูปภาพ
            );
        }
        return $result;
    }
}
