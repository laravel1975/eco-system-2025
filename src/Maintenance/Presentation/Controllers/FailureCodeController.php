<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use TmrEcosystem\Maintenance\Domain\Models\FailureCode;

class FailureCodeController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        // (ดึงมาทั้ง List และให้ Frontend จัดการ)
        // (หรือดึงแบบ Hierarchy: ->whereNull('parent_id')->with('children'))
        $failureCodes = FailureCode::where('company_id', $companyId)
            ->with('parent:id,name') // (ดึงชื่อ Parent มาแสดง)
            ->orderBy('code')
            ->paginate(20);

        // (ดึง List ทั้งหมดมาสำหรับ Dropdown)
        $allCodes = FailureCode::where('company_id', $companyId)
            ->get(['id', 'name', 'code']);

        return inertia('Maintenance/FailureCodes/Index', [
            'failureCodes' => $failureCodes,
            'allCodes' => $allCodes, // (สำหรับ Dropdown 'Parent')
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => [
                'required', 'string', 'max:10',
                Rule::unique('failure_codes')->where('company_id', $companyId)
            ],
            'parent_id' => [
                'nullable',
                Rule::exists('failure_codes', 'id')->where('company_id', $companyId)
            ],
        ]);

        FailureCode::create($validated + ['company_id' => $companyId]);
        return redirect()->back()->with('success', 'สร้าง Failure Code เรียบร้อย');
    }

    public function update(Request $request, FailureCode $failureCode): RedirectResponse
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => [
                'required', 'string', 'max:10',
                Rule::unique('failure_codes')->where('company_id', $companyId)->ignore($failureCode->id)
            ],
            'parent_id' => [
                'nullable',
                Rule::exists('failure_codes', 'id')->where('company_id', $companyId),
                Rule::notIn([$failureCode->id]) // (ป้องกันการเป็น Parent ของตัวเอง)
            ],
        ]);

        $failureCode->update($validated);
        return redirect()->back()->with('success', 'อัปเดต Failure Code เรียบร้อย');
    }

    public function destroy(FailureCode $failureCode): RedirectResponse
    {
        // (ควรเพิ่ม Logic ตรวจสอบว่าถูกใช้งานหรือไม่)
        // (ควรเพิ่ม Logic จัดการ Children (เช่น set null))
        $failureCode->children()->update(['parent_id' => null]);
        $failureCode->delete();

        return redirect()->back()->with('success', 'ลบ Failure Code เรียบร้อย');
    }
}
