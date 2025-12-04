<?php

namespace TmrEcosystem\IAM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->can('create roles');
    }

    public function rules(): array
    {
        return [
            // Spatie ต้องการ 'name' ที่ไม่ซ้ำกัน
            'name' => 'required|string|max:100|unique:roles,name',
        ];
    }
}
