<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // (ควรใส่สิทธิ์)
    }

    public function rules(): array
    {
        $position = $this->route('position');

        $companyId = auth()->user()->hasRole('Super Admin')
            ? $this->input('company_id')
            : $position->company_id;

        return [
            'title' => [
                'required', 'string', 'max:255',
                Rule::unique('positions')
                    ->where('department_id', $this->input('department_id'))
                    ->ignore($position->id) // (ยกเว้นตัวเอง)
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
