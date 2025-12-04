<?php

namespace TmrEcosystem\Maintenance\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompleteWorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'failure_code_id' => ['required', Rule::exists('failure_codes', 'id')->where('company_id', $companyId)],
            'activity_type_id' => ['required', Rule::exists('activity_types', 'id')->where('company_id', $companyId)],
            'downtime_hours' => 'required|numeric|min:0',

            // ( [ลบ] 'actual_labor_hours' (แบบรวม))

            // ( [ใหม่] รับ 'assignments' (แบบ Array))
            'assignments' => 'present|array',
            'assignments.*.id' => [ // (ID ของ MaintenanceAssignment)
                'required',
                Rule::exists('maintenance_assignments', 'id')
                    ->where('work_order_id', $this->workOrder->id) // (ต้องเป็นของ WO นี้)
            ],
            'assignments.*.hours' => 'required|numeric|min:0.1',
        ];
    }
}
