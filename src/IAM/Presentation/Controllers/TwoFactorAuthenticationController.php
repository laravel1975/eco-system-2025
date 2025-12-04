<?php
namespace TmrEcosystem\IAM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FALaravel\Google2FA as Google2FALaravel; // <-- (แก้ไขจาก Error)

class TwoFactorAuthenticationController extends Controller
{
    public function store(Request $request, Google2FALaravel $google2fa): RedirectResponse
    {
        $user = $request->user();
        $secretKey = $google2fa->generateSecretKey();
        $recoveryCodes = Collection::times(8, fn () => \Illuminate\Support\Str::random(10) . '-' . \Illuminate\Support\Str::random(10));

        $user->forceFill([
            'two_factor_secret' => $secretKey,
            'two_factor_recovery_codes' => $recoveryCodes->all(),
            'two_factor_confirmed_at' => null,
        ])->save();

        $qrCodeSvg = $google2fa->getQRCodeInLine( // <-- (แก้ไขจาก Error)
            config('app.name'),
            $user->email,
            $secretKey
        );
        $qrCodeSvg = str_replace('<?xml version="1.0" encoding="UTF-8"?>', '', $qrCodeSvg);

        return back()->with('status', 'two-factor-enabled')
                     ->with('qrCodeSvg', $qrCodeSvg)
                     ->with('recoveryCodes', $recoveryCodes->all());
    }

    public function update(Request $request, Google2FALaravel $google2fa): RedirectResponse
    {
        $user = $request->user();
        $isValid = $google2fa->verifyKey($user->two_factor_secret, $request->input('code'));

        if ($isValid) {
            $user->forceFill(['two_factor_confirmed_at' => now()])->save();
            return back()->with('status', 'two-factor-confirmed');
        }

        throw ValidationException::withMessages([
            'code' => 'The provided two factor authentication code was invalid.',
        ])->errorBag('confirmTwoFactor');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'password' => __('This password does not match our records.'),
            ])->errorBag('disableTwoFactor');
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return back(303);
    }
}
