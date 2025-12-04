<?php

namespace TmrEcosystem\Stock\Application\DTOs;

use Spatie\LaravelData\Data;

class StockLevelIndexData extends Data
{
    public function __construct(
        public string $stock_level_uuid,

        // ✅ เพิ่ม Field ที่จำเป็นสำหรับ Frontend Logic
        public string $item_uuid,
        public string $warehouse_uuid,
        public string $location_uuid,

        public string $item_part_number,
        public string $item_name,
        public string $warehouse_code,
        public string $warehouse_name,
        public string $location_code,
        public string $location_type,

        public float $quantity_on_hand,
        public float $quantity_reserved,
        public float $quantity_soft_reserved,
        public float $quantity_available
    ) {}

    public static function fromQueryResult(mixed $data): self
    {
        $onHand = (float) $data->quantity_on_hand;
        $reserved = (float) $data->quantity_reserved;
        $softReserved = (float) $data->quantity_soft_reserved;

        return new self(
            stock_level_uuid: $data->stock_level_uuid,

            // ✅ [Map ค่าเพิ่ม] ดึงจาก Query Result
            item_uuid: $data->item_uuid,
            warehouse_uuid: $data->warehouse_uuid,
            location_uuid: $data->location_uuid,

            item_part_number: $data->item_part_number,
            item_name: $data->item_name,
            warehouse_code: $data->warehouse_code,
            warehouse_name: $data->warehouse_name,
            location_code: $data->location_code ?? 'N/A',
            location_type: $data->location_type ?? 'UNKNOWN',
            quantity_on_hand: $onHand,
            quantity_reserved: $reserved,
            quantity_soft_reserved: $softReserved,
            quantity_available: $onHand - $reserved
        );
    }
}
