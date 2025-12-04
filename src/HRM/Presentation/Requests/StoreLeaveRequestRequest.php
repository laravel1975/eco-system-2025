<?php

namespace TmrEcosystem\HRM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use TmrEcosystem\HRM\Domain\Models\LeaveType;

class StoreLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // (อนุญาตให้ผู้ใช้ที่ล็อกอินส่งใบลา)
    }

    public function rules(): array
    {
        return [
            'leave_type_id' => 'required|integer|exists:leave_types,id',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after_or_equal:start_datetime',
            'reason' => 'nullable|string|max:1000',
            // (เราจะคำนวณ total_days ใน Controller)
        ];
    }

    // (คุณสามารถเพิ่ม Custom Rule ที่นี่เพื่อเช็คโควต้าวันลาคงเหลือได้)
}
