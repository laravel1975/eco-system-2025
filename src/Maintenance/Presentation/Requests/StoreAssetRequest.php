<?php

namespace TmrEcosystem\Maintenance\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        // (ควรใช้ Policy)
        return auth()->check();
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'name' => 'required|string|max:255',
            'asset_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('assets')->where('company_id', $companyId)
            ],
            'description' => 'nullable|string',

            // (1. 👈 [แก้ไข] Validate UUID)
            'warehouse_uuid' => [
                'nullable',
                'uuid',
                // (เช็กว่า UUID นี้มีอยู่จริงในตาราง 'warehouses' ของ BC อื่น)
                Rule::exists('warehouses', 'uuid')->where('company_id', $companyId)
            ],
            // (2. 👈 [ลบ] 'location' (String) ออก)
            // 'location' => 'nullable|string|max:255',

            'model_number' => 'nullable|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'purchase_date' => 'nullable|date',
            'warranty_end_date' => 'nullable|date|after_or_equal:purchase_date',
            'status' => 'nullable|string|max:50',
        ];
    }
}
