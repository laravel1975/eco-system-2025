<?php

namespace TmrEcosystem\IAM\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->can('create users');
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'avatar_url' => 'nullable|string|url|max:255',
            'is_active' => 'required|boolean',
            'password' => ['required', 'confirmed', Password::defaults()],
            'company_id' => 'required|exists:companies,id',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ];
    }
}
