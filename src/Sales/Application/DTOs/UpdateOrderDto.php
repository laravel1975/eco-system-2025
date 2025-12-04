<?php

namespace TmrEcosystem\Sales\Application\DTOs;

use Illuminate\Http\Request;

readonly class UpdateOrderItemDto
{
    public function __construct(
        public ?string $id, // ✅ เพิ่ม id (Nullable เพราะสินค้าใหม่อาจไม่มี id)
        public string $productId,
        public int $quantity
    ) {}
}

readonly class UpdateOrderDto
{
    public function __construct(
        public string $customerId,
        public array $items, // Array of UpdateOrderItemDto
        public ?string $note = null,
        public ?string $paymentTerms = null,
        public bool $confirmOrder = false
    ) {}

    public static function fromRequest(Request $request): self
    {
        $data = $request->validate([
            'customer_id' => 'required',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable', // ✅ อนุญาตให้ส่ง id มา
            'items.*.product_id' => 'required',
            'items.*.quantity' => 'required|integer|min:0', // 0 = remove
            'note' => 'nullable|string',
            'payment_terms' => 'nullable|string',
            'action' => 'nullable|string',
        ]);

        $items = array_map(
            fn($item) => new UpdateOrderItemDto(
                $item['id'] ?? null, // ✅ Map id
                $item['product_id'],
                (int)$item['quantity']
            ),
            $data['items']
        );

        return new self(
            customerId: $data['customer_id'],
            items: $items,
            note: $data['note'] ?? null,
            paymentTerms: $data['payment_terms'] ?? null,
            confirmOrder: ($data['action'] ?? '') === 'confirm'
        );
    }
}
