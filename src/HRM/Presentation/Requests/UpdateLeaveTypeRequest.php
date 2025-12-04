<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeaveTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // (ควรใส่สิทธิ์ 'manage leave types')
    }

    public function rules(): array
    {
        $leaveType = $this->route('leave_type');

        $companyId = auth()->user()->hasRole('Super Admin')
            ? $this->input('company_id')
            : $leaveType->company_id;

        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('leave_types')
                    ->where('company_id', $companyId)
                    ->ignore($leaveType->id) // (ยกเว้นตัวเอง)
            ],
            'code' => [
                'nullable', 'string', 'max:50',
                Rule::unique('leave_types')
                    ->where('company_id', $companyId)
                    ->ignore($leaveType->id)
            ],
            'is_paid' => 'required|boolean',
            'max_days_per_year' => 'nullable|numeric|min:0|max:365',
            'company_id' => [
                Rule::requiredIf(auth()->user()->hasRole('Super Admin')),
                'integer',
                Rule::exists('companies', 'id')
            ],
        ];
    }
}
