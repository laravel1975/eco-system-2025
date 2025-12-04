<?php

namespace TmrEcosystem\Maintenance\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;

class UpdateWorkOrderRequest extends FormRequest
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
            // 'asset_id' => [
            //     'sometimes', 'required',
            //     Rule::exists('assets', 'id')->where('company_id', $companyId)
            // ], // (รอสร้าง Model Asset)
            'asset_id' => 'sometimes|required|string', // (ใช้ชั่วคราว)

            'maintenance_type_id' => [
                'sometimes', 'required',
                Rule::exists('maintenance_types', 'id')->where('company_id', $companyId)
            ],

            'description' => 'sometimes|required|string|min:10|max:1000',

            'priority' => [
                'sometimes', 'required',
                Rule::in([
                    WorkOrder::PRIORITY_LOW,
                    WorkOrder::PRIORITY_MEDIUM,
                    WorkOrder::PRIORITY_HIGH,
                ])
            ],
        ];
    }
}
