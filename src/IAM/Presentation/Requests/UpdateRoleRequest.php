<?php

namespace TmrEcosystem\IAM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // <--- 1. Import Rule

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->can('edit roles');
    }

    public function rules(): array
    {
        // 2. ดึง ID ของ Role จาก Route
        $roleId = $this->route('role')->id;

        return [
            // 3. แก้ไขกฎ Unique
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('roles', 'name')->ignore($roleId) // <-- ยกเว้นตัวเอง
            ],
            'permissions' => 'nullable|array', // 'permissions' ต้องเป็น array (หรือไม่มีเลย)
            'permissions.*' => 'exists:permissions,id', // 'permissions.*' (ทุกตัวใน array) ต้องมีอยู่ในตาราง permissions
        ];
    }
}
