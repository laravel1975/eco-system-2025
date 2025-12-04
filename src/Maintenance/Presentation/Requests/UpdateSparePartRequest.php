<?php

namespace TmrEcosystem\Maintenance\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSparePartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $sparePartId = $this->spare_part->id;
        $companyId = $this->user()->company_id;

        return [
            'name' => 'sometimes|required|string|max:255',
            'part_number' => [
                'sometimes', 'required', 'string', 'max:50',
                Rule::unique('spare_parts')->where('company_id', $companyId)->ignore($sparePartId)
            ],

            // (1. 👈 [แก้ไข] Validate UUID)
            'item_uuid' => [
                'sometimes', 'required', 'uuid',
                Rule::exists('items', 'uuid')->where('company_id', $companyId),
                Rule::unique('spare_parts', 'item_uuid')
                    ->where('company_id', $companyId)
                    ->ignore($sparePartId)
            ],

            'description' => 'nullable|string',

            // (2. 👈 [ลบ] Rules ของ Stock BC เก่าทิ้ง)
            // 'unit_cost' => 'nullable|numeric|min:0|decimal:0,2',
            // 'reorder_level' => 'nullable|integer|min:0',
            // 'location' => 'nullable|string|max:255',
        ];
    }
}
