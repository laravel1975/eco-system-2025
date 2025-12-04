<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        // (ปรับสิทธิ์ตามต้องการ เช่น 'manage employees')
        return true;
    }

    public function rules(): array
    {
        $companyId = auth()->user()->hasRole('Super Admin')
            ? $this->input('company_id')
            : auth()->user()->company_id;

        return [
            'first_name'    => 'required|string|max:255',
            'last_name'     => 'required|string|max:255',
            'job_title'     => 'nullable|string|max:255',
            'join_date'     => 'required|date',
            'hourly_rate'   => ['nullable', 'numeric', 'min:0'],

            // --- (1. เพิ่ม Rule นี้) ---
            'employee_id_no' => [
                'nullable',
                'string',
                'max:100',
                // (ต้องไม่ซ้ำกันในตาราง employee_profiles)
                Rule::unique(EmployeeProfile::class)
            ],
            // --- (สิ้นสุดการเพิ่ม) ---

            'department_id' => [
                'required',
                'integer',
                Rule::exists('departments', 'id')->where('company_id', $companyId)
            ],
            'user_id' => [
                'nullable',
                Rule::when(
                    $this->input('user_id') && $this->input('user_id') !== 'no_user_link',
                    [
                        'integer',
                        Rule::exists('users', 'id'),
                        Rule::unique(EmployeeProfile::class, 'user_id')
                    ]
                )
            ],
            'company_id' => [
                Rule::requiredIf(auth()->user()->hasRole('Super Admin')),
                'integer',
                Rule::exists('companies', 'id')
            ],
        ];
    }
}
