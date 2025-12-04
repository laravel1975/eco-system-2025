<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate; // <--- เพิ่ม
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use TmrEcosystem\IAM\Domain\Models\User; // <--- เพิ่ม

class AuthServiceProvider extends ServiceProvider
{

    public function boot(): void
    {
        $this->registerPolicies();

        // ให้ Super Admin ผ่านทุก Gate/Policy
        Gate::before(function (User $user, $ability) {
            return $user->hasRole('Super Admin') ? true : null;
        });
    }
}
