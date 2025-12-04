<?php

namespace TmrEcosystem\Inventory\Application\UseCases\ManageItems;

use TmrEcosystem\Inventory\Domain\Repositories\ItemRepositoryInterface;
use Exception;

class DeleteItemUseCase
{
    // (Inject Interface)
    public function __construct(
        protected ItemRepositoryInterface $itemRepository
    ) {
    }

    /**
     * (ทำให้เป็น Invokable)
     * @param string $uuid UUID ของ Item ที่จะลบ
     */
    public function __invoke(string $uuid): void
    {
        // 1. ค้นหา POPO
        $item = $this->itemRepository->findByUuid($uuid);

        if (!$item) {
            throw new Exception("Item not found with UUID: {$uuid}");
        }

        // 2. (ในอนาคต) เพิ่ม Business Logic ที่นี่
        // if ($this->stockRepository->hasStock($item)) {
        //     throw new Exception("Cannot delete item with stock.");
        // }

        // 3. สั่ง Repository ให้ลบ
        $this->itemRepository->delete($item);
    }
}
