<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHolidayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // (ควรใส่สิทธิ์ 'manage holidays')
    }

    public function rules(): array
    {
        $companyId = auth()->user()->hasRole('Super Admin')
            ? $this->input('company_id')
            : auth()->user()->company_id;

        return [
            'name' => 'required|string|max:255',
            'date' => [
                'required', 'date_format:Y-m-d',
                // (ป้องกันวันหยุดซ้ำซ้อนในบริษัทเดียวกัน)
                Rule::unique('holidays')
                    ->where('company_id', $companyId)
                    ->where('date', $this->input('date'))
            ],
            'is_recurring' => 'required|boolean',
            'company_id' => [
                Rule::requiredIf(auth()->user()->hasRole('Super Admin')),
                'integer',
                Rule::exists('companies', 'id')
            ],
        ];
    }
}
