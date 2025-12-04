<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('manage companies');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // ดึง ID ของ company ที่กำลังจะอัปเดต
        $companyId = $this->route('company')->id;

        return [
            // 3. แก้ไขกฎ unique
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('companies', 'name')->ignore($companyId)
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('companies', 'email')->ignore($companyId)
            ],

            // (Rules ที่เหลือเหมือนเดิม)
            'phone' => 'nullable|string|max:20',
            'registration_no' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'is_active' => 'required|boolean',
        ];
    }
}
