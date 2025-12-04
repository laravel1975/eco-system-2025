<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmergencyContactRequest extends FormRequest
{
    /**
     * ตรวจสอบสิทธิ์ (เช่น ต้องเป็น HR หรือเป็นเจ้าของโปรไฟล์)
     */
    public function authorize(): bool
    {
        // (ควรเพิ่ม Logic ตรวจสอบสิทธิ์ที่นี่)
        return true;
    }

    /**
     * กฎการ Validation
     */
    public function rules(): array
    {
        return [
            'name'         => 'required|string|max:255',
            'relationship' => 'required|string|max:100', // (เช่น บิดา, มารดา, คู่สมรส)
            'phone_number' => 'required|string|max:50',
        ];
    }
}
