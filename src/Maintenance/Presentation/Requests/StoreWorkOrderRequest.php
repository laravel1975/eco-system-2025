<?php

namespace TmrEcosystem\Maintenance\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;

class StoreWorkOrderRequest extends FormRequest
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
            'asset_id' => [
                'required',
                Rule::exists('assets', 'id')->where('company_id', $companyId)
            ],
            'maintenance_type_id' => [
                'required',
                Rule::exists('maintenance_types', 'id')->where('company_id', $companyId)
            ],
            'description' => 'required|string|min:10|max:1000',

            // (2. [อัปเกรด] Priority ให้รับ P1-P4)
            'priority' => [
                'required',
                Rule::in([
                    WorkOrder::PRIORITY_EMERGENCY,
                    WorkOrder::PRIORITY_URGENT,
                    WorkOrder::PRIORITY_NORMAL,
                    WorkOrder::PRIORITY_LOW,
                ])
            ],

            // (3. [ใหม่] เพิ่ม Work Nature)
            'work_nature' => [
                'required',
                Rule::in([
                    WorkOrder::NATURE_INTERNAL,
                    WorkOrder::NATURE_EXTERNAL,
                    WorkOrder::NATURE_MIXED,
                ])
            ],
        ];
    }
}
