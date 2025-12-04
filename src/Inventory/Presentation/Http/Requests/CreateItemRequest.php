<?php

namespace TmrEcosystem\Inventory\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateItemRequest extends FormRequest
{
    /**
     * (เราจะใช้ Policy ในอนาคต)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * กฎการ Validate (เฉพาะ "รูปแบบ" เท่านั้น)
     * (Use Case จะเช็ก Logic 'Part Number ซ้ำ' เอง)
     * (อ้างอิงจาก ItemData DTO)
     */
    public function rules(): array
    {
        return [
            'part_number' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'uom_id' => 'required|uuid|exists:inventory_uoms,id',
            'category_id' => 'nullable|uuid|exists:inventory_categories,id',
            'average_cost' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ];
    }
}
