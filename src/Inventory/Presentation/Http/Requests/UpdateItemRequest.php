<?php

namespace TmrEcosystem\Inventory\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request Validation สำหรับการ "อัปเดต" Item
 * รองรับการแก้ไขข้อมูลพื้นฐาน และการจัดการรูปภาพ (เพิ่ม/ลบ/ตั้งรูปหลัก)
 */
class UpdateItemRequest extends FormRequest
{
    /**
     * ตรวจสอบสิทธิ์ (Authorize)
     * ในอนาคตสามารถใส่ Logic เช่น $user->can('update', $item) ได้ที่นี่
     */
    public function authorize(): bool
    {
        return true; // อนุญาตไปก่อน
    }

    /**
     * กฎการ Validate (Rules)
     */
    public function rules(): array
    {
        return [
            // --- 1. Basic Info ---
            'part_number' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'uom_id' => 'required|uuid|exists:inventory_uoms,id',
            'category_id' => 'nullable|uuid|exists:inventory_categories,id',
            'average_cost' => 'required|numeric|min:0',
            'description' => 'nullable|string',

            // --- 2. Image Management ---

            // (A) รูปภาพใหม่ที่อัปโหลดเพิ่ม
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // สูงสุด 5MB ต่อรูป

            // (B) รายการ ID ของรูปเก่าที่จะลบ
            'removed_image_ids' => 'nullable|array',
            'removed_image_ids.*' => 'integer|exists:inventory_item_images,id',

            // (C) ID ของรูปที่จะตั้งเป็นรูปหลัก (Primary)
            'set_primary_image_id' => 'nullable|integer|exists:inventory_item_images,id',
        ];
    }
}
