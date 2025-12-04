<?php
// Sales BC ไม่เรียก Database ของ Inventory ตรงๆ แต่ผ่าน ProductCatalogInterface (Adapter Pattern)

namespace TmrEcosystem\Sales\Domain\Services;

// นี่คือโครงสร้างข้อมูลที่ Sales ต้องการจาก Inventory
readonly class ProductData
{
    public function __construct(
        public string $id,
        public string $name,
        public float $price,
        public int $stockAvailable, // เผื่อเช็คเบื้องต้น (แต่การจองจริงอยู่ที่ Event)
        public ?string $imageUrl = null
    ) {}
}

interface ProductCatalogInterface
{
    /**
     * @param string $productId
     * @return ProductData|null
     */
    public function findProduct(string $productId): ?ProductData;

    /**
     * เช็คสินค้าหลายชิ้นพร้อมกัน (เพื่อ Performance)
     * @param array $productIds
     * @return array<string, ProductData> Key คือ ProductId
     */
    public function getProductsByIds(array $productIds): array;
}
