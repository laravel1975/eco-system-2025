<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // (ตรวจสอบสิทธิ์ว่าสามารถ "จัดการ" เวลาเข้า-ออก ได้หรือไม่)
        return auth()->user()->can('manage attendance');
    }

    public function rules(): array
    {
        return [
            'employee_profile_id' => 'required|integer|exists:employee_profiles,id',
            'date' => 'required|date_format:Y-m-d',
            'status' => [
                'required',
                'string',
                // (สถานะที่อนุญาตให้ HR/Manager บันทึก)
                Rule::in(['present', 'late', 'absent', 'on_leave', 'holiday', 'wfh']),
            ],

            // (เวลาอาจเป็น null ถ้าสถานะเป็น absent, on_leave, holiday)
            'clock_in' => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i|after_or_equal:clock_in',

            'notes' => 'nullable|string|max:1000', // (เหตุผลการแก้ไข)
        ];
    }
}
