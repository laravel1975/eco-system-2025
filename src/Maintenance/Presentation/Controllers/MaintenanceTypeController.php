<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceType;

class MaintenanceTypeController extends Controller
{
    /**
     * แสดงรายการ Maintenance Types ทั้งหมด (หน้า Admin)
     */
    public function index(Request $request)
    {
        $types = MaintenanceType::where('company_id', $request->user()->company_id)
            ->latest()
            ->paginate(10);

        return inertia('Maintenance/Types/Index', [
            'types' => $types,
        ]);
    }

    /**
     * บันทึก Maintenance Type ใหม่
     */
    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => [
                'required',
                'string',
                'max:10',
                Rule::unique('maintenance_types')->where('company_id', $companyId)
            ],
            'description' => 'nullable|string|max:500',
        ]);

        MaintenanceType::create($validated + ['company_id' => $companyId]);

        return redirect()->back()->with('success', 'สร้างประเภทงานซ่อมเรียบร้อย');
    }

    /**
     * อัปเดต Maintenance Type
     */
    public function update(Request $request, MaintenanceType $type): RedirectResponse
    {
        // $this->authorize('update', $type); // (Policy)
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => [
                'required',
                'string',
                'max:10',
                Rule::unique('maintenance_types')->where('company_id', $companyId)->ignore($type->id)
            ],
            'description' => 'nullable|string|max:500',
        ]);

        $type->update($validated);

        return redirect()->back()->with('success', 'อัปเดตประเภทงานซ่อมเรียบร้อย');
    }

    /**
     * ลบ Maintenance Type
     */
    public function destroy(MaintenanceType $type): RedirectResponse
    {
        // $this->authorize('delete', $type); // (Policy)

        // (ควรเพิ่ม Logic ตรวจสอบว่า Type นี้ถูกใช้งานอยู่หรือไม่)
        // if ($type->workOrders()->exists()) {
        //     return redirect()->back()->with('error', 'ไม่สามารถลบได้ เนื่องจากถูกใช้งานอยู่');
        // }

        $type->delete();

        return redirect()->back()->with('success', 'ลบประเภทงานซ่อมเรียบร้อย');
    }
}
