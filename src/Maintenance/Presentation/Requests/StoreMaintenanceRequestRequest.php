<?php

namespace TmrEcosystem\Maintenance\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaintenanceRequestRequest extends FormRequest
{
    /**
     * ตรวจสอบว่าผู้ใช้มีสิทธิ์ส่งคำขอนี้หรือไม่
     */
    public function authorize(): bool
    {
        // ในที่นี้อนุญาตทุกคนที่ Login (ควรปรับตาม Policy ของคุณ)
        return auth()->check();
    }

    /**
     * กฎการตรวจสอบความถูกต้องของข้อมูล
     */
    public function rules(): array
    {
        // เราต้องแน่ใจว่า Asset ที่ส่งมา อยู่ใน Company เดียวกับผู้ใช้
        $companyId = auth()->user()->company_id;

        return [
            'asset_id' => [
                'required',
                Rule::exists('assets', 'id')->where(function ($query) use ($companyId) {
                    $query->where('company_id', $companyId);
                }),
            ],
            'asset_id' => 'required|string', // (ใช้ชั่วคราวจนกว่าจะมี Model Asset)
            'problem_description' => 'required|string|min:10|max:1000',
        ];
    }
}
