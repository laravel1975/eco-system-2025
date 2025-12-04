<?php

namespace TmrEcosystem\Warehouse\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateWarehouseRequest extends FormRequest
{
    /**
     * ตรวจสอบสิทธิ์ (ในอนาคตคือ 'create-warehouse' permission)
     */
    public function authorize(): bool
    {
        return true; // (อนุญาตไปก่อน)
    }

    /**
     * กฎการ Validate (เฉพาะ "รูปแบบ" เท่านั้น)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100', // (รหัสมักจะสั้นกว่าชื่อ)
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean', // (รับค่า true/false)

            // (เราไม่เช็ก Rule::unique('code') ที่นี่)
            // (CreateWarehouseUseCase จะเป็นคนจัดการเรื่องนี้เอง)
        ];
    }
}
