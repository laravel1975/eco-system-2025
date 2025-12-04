<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOvertimeRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // (อนุญาตให้ผู้ใช้ที่ล็อกอินส่งคำขอ)
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'ot_type' => [
                'required',
                'string',
                Rule::in(['normal', 'weekend', 'holiday']), // (ประเภท OT)
            ],
            'reason' => 'nullable|string|max:1000',
        ];
    }
}
