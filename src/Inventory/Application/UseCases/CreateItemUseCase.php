<?php

namespace TmrEcosystem\Inventory\Application\UseCases;

use TmrEcosystem\Inventory\Application\DTOs\ItemData;
use TmrEcosystem\Inventory\Domain\Repositories\ItemRepositoryInterface;
use TmrEcosystem\Inventory\Application\Exceptions\PartNumberExistsException; // (เราจะสร้างไฟล์นี้)

/**
 * นี่คือ "Use Case" หรือ "Application Service"
 * ทำหน้าที่จัดการตรรกะทางธุรกิจ (Business Logic) ของการสร้าง Item
 */
class CreateItemUseCase
{
    // (1) เรา "ขอ" (depend on) Interface, ไม่ใช่คลาส Eloquent โดยตรง
    public function __construct(
        protected ItemRepositoryInterface $itemRepository
    ) {
    }

    /**
     * เมธอดหลักในการทำงาน
     *
     * @param ItemData $data DTO ที่สะอาดแล้ว
     * @return void
     * @throws PartNumberExistsException
     */
    public function execute(ItemData $data): void
    {
        // (2) ▼▼▼ นี่คือ Business Logic ▼▼▼
        // "ห้ามสร้าง Item ถ้า Part Number ซ้ำ"
        if ($this->itemRepository->partNumberExists($data->part_number)) {
            // โยน Exception ที่มีความหมายทางธุรกิจ
            throw new PartNumberExistsException(
                "Part number '{$data->part_number}' already exists."
            );
        }
        // (2) ▲▲▲ จบส่วน Business Logic ▲▲▲


        // (3) ส่งต่อคำสั่งไปยัง Repository (ชั้น Infrastructure)
        // Use Case ไม่จำเป็นต้องรู้ว่า 'create' ทำงานยังไง
        $this->itemRepository->create($data);
    }
}
