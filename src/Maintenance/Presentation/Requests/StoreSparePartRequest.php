<?php

namespace TmrEcosystem\Maintenance\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSparePartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'name' => 'required|string|max:255',
            'part_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('spare_parts')->where('company_id', $companyId)
            ],

            // (1. 👈 [แก้ไข] Validate UUID)
            'item_uuid' => [
                'required',
                'uuid',
                // (เช็กว่า UUID นี้มีอยู่จริงในตาราง 'items' ของ BC อื่น)
                Rule::exists('items', 'uuid')->where('company_id', $companyId),
                // (เช็กว่า item_uuid นี้ ยังไม่ถูกผูกกับ spare_part อื่น)
                Rule::unique('spare_parts', 'item_uuid')->where('company_id', $companyId)
            ],

            'description' => 'nullable|string',

            // (2. 👈 [ลบ] Rules ของ Stock BC เก่าทิ้ง)
            // 'stock_quantity' => 'required|integer|min:0',
            // 'unit_cost' => 'nullable|numeric|min:0|decimal:0,2',
            // 'reorder_level' => 'nullable|integer|min:0',
            // 'location' => 'nullable|string|max:255',
        ];
    }
}
