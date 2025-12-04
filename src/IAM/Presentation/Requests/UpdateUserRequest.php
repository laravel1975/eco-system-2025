<?php

namespace TmrEcosystem\IAM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // <--- 1. Import Rule
use Illuminate\Validation\Rules\Password;
use TmrEcosystem\IAM\Domain\Models\User; // <--- 2. Import User

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->can('edit users');
    }

    public function rules(): array
    {
        // 3. ดึง User ID จาก Route
        $userId = $this->route('user')->id;

        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($userId)
            ],
            'phone' => 'nullable|string|max:20',
            'avatar_url' => 'nullable|string|url|max:255',
            'is_active' => 'required|boolean',
            'password' => [
                'nullable',
                'confirmed',
                Password::defaults()
            ],
            'company_id' => 'required|exists:companies,id',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ];
    }
}
