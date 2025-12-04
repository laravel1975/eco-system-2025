<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // (1. Import Rule)

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // (2. แก้ไข Bug)
        return auth()->user()->can('create departments');
    }

    public function rules(): array
    {
        // (3. เพิ่ม Logic)
        $companyId = auth()->user()->hasRole('Super Admin')
            ? $this->input('company_id')
            : auth()->user()->company_id;

        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'company_id' => [
                Rule::requiredIf(auth()->user()->hasRole('Super Admin')),
                'integer',
                Rule::exists('companies', 'id')
            ],
            'parent_id' => [
                'nullable', 'integer',
                // (Parent ต้องอยู่ใน Company เดียวกัน)
                Rule::exists('departments', 'id')->where('company_id', $companyId)
            ],
        ];
    }
}
