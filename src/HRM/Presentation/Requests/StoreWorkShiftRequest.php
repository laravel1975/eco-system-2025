<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // (ควรใส่สิทธิ์ 'manage work shifts')
    }

    public function rules(): array
    {
        $companyId = auth()->user()->hasRole('Super Admin')
            ? $this->input('company_id')
            : auth()->user()->company_id;

        return [
            'name' => [
                'required', 'string', 'max:255',
                // (ชื่อกะต้องไม่ซ้ำกันในบริษัทเดียวกัน)
                Rule::unique('work_shifts')->where('company_id', $companyId)
            ],
            'code' => 'nullable|string|max:50',
            'is_flexible' => 'required|boolean',

            // (ต้องระบุ ถ้า is_flexible = false)
            'start_time' => 'required_if:is_flexible,false|nullable|date_format:H:i',
            'end_time' => 'required_if:is_flexible,false|nullable|date_format:H:i',

            'work_hours_per_day' => 'required|numeric|min:0|max:24',

            'company_id' => [
                Rule::requiredIf(auth()->user()->hasRole('Super Admin')),
                'integer',
                Rule::exists('companies', 'id')
            ],
        ];
    }
}
