<?php
namespace TmrEcosystem\IAM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FALaravel\Google2FA as Google2FALaravel;
use Illuminate\Support\Facades\Auth;
use TmrEcosystem\IAM\Domain\Models\User;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response | RedirectResponse
    {
        if (! $request->session()->has('login.id')) {
            return Inertia::location(route('login'));
        }
        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function store(Request $request, Google2FALaravel $google2fa): RedirectResponse
    {
        $userId = $request->session()->get('login.id');
        $user = User::findOrFail($userId);

        $isValid = $google2fa->verifyKey($user->two_factor_secret, $request->input('code'));

        if ($isValid) {
            Auth::login($user, $request->session()->get('login.remember', false));
            $request->session()->forget('login.id');
            $request->session()->forget('login.remember');
            return redirect()->intended('/dashboard'); // <-- (แก้ไขจาก Error)
        }

        return back()->withErrors(['code' => 'The provided two factor authentication code was invalid.']);
    }
}
