<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // (ควรเช็คสิทธิ์)
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'document_type' => 'required|string|max:100',
            'expires_at' => 'nullable|date',

            // (สำคัญ) กฎสำหรับไฟล์
            'document' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,jpg,jpeg,png', // (ประเภทไฟล์ที่อนุญาต)
                'max:5120', // (ขนาดสูงสุด 5MB)
            ],
        ];
    }
}
