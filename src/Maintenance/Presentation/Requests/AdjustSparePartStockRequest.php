<?php

namespace TmrEcosystem\Maintenance\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // (1. 👈 Import Rule)

class AdjustSparePartStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'new_quantity' => 'required|integer|min:0',
            'reason' => 'required|string|max:255',

            // (2. 👈 [ใหม่] เราบังคับให้ UI ต้องส่งคลังมาด้วย)
            'warehouse_uuid' => [
                'required',
                'uuid',
                Rule::exists('warehouses', 'uuid')->where('company_id', $companyId)
            ],
        ];
    }
}
