<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // เราใช้ middleware 'can:manage companies' ที่ route แล้ว
        // แต่การเช็กที่นี่อีกชั้นก็ปลอดภัยดีครับ
        return auth()->user()->can('manage companies');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // อ้างอิงจาก migration `create_companies_table`
        return [
            'name' => 'required|string|max:255|unique:companies,name',
            'email' => 'nullable|email|max:255|unique:companies,email',
            'phone' => 'nullable|string|max:20',
            'registration_no' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',

            // เราจะเพิ่ม field นี้ในฟอร์ม (Switch)
            'is_active' => 'required|boolean',
        ];
    }
}
