<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // (ควรใส่สิทธิ์)
    }

    public function rules(): array
    {
        $companyId = auth()->user()->hasRole('Super Admin')
            ? $this->input('company_id')
            : auth()->user()->company_id;

        return [
            'title' => [
                'required', 'string', 'max:255',
                // (ตำแหน่งงานต้องไม่ซ้ำกัน "ภายในแผนกเดียวกัน")
                Rule::unique('positions')->where('department_id', $this->input('department_id'))
            ],
            'description' => 'nullable|string|max:1000',
            'department_id' => [
                'required', 'integer',
                Rule::exists('departments', 'id')->where('company_id', $companyId)
            ],
            'company_id' => [
                Rule::requiredIf(auth()->user()->hasRole('Super Admin')),
                'integer',
                Rule::exists('companies', 'id')
            ],
        ];
    }
}
