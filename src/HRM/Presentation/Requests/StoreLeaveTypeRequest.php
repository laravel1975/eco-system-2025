<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeaveTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // (ควรใส่สิทธิ์ 'manage leave types')
    }

    public function rules(): array
    {
        $companyId = auth()->user()->hasRole('Super Admin')
            ? $this->input('company_id')
            : auth()->user()->company_id;

        return [
            'name' => [
                'required', 'string', 'max:255',
                // (ชื่อต้องไม่ซ้ำกันในบริษัทเดียวกัน)
                Rule::unique('leave_types')->where('company_id', $companyId)
            ],
            'code' => [
                'nullable', 'string', 'max:50',
                Rule::unique('leave_types')->where('company_id', $companyId)
            ],
            'is_paid' => 'required|boolean',
            'max_days_per_year' => 'nullable|numeric|min:0|max:365', // (โควต้าวันลา)

            'company_id' => [
                Rule::requiredIf(auth()->user()->hasRole('Super Admin')),
                'integer',
                Rule::exists('companies', 'id')
            ],
        ];
    }
}
