<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use TmrEcosystem\Maintenance\Domain\Models\ActivityType;

class ActivityTypeController extends Controller
{
    public function index(Request $request)
    {
        $activities = ActivityType::where('company_id', $request->user()->company_id)
            ->latest()
            ->paginate(10);

        return inertia('Maintenance/ActivityTypes/Index', [
            'activities' => $activities,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => [
                'required', 'string', 'max:10',
                Rule::unique('activity_types')->where('company_id', $companyId)
            ],
        ]);

        ActivityType::create($validated + ['company_id' => $companyId]);
        return redirect()->back()->with('success', 'สร้าง Activity Type เรียบร้อย');
    }

    public function update(Request $request, ActivityType $activityType): RedirectResponse
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => [
                'required', 'string', 'max:10',
                Rule::unique('activity_types')->where('company_id', $companyId)->ignore($activityType->id)
            ],
        ]);

        $activityType->update($validated);
        return redirect()->back()->with('success', 'อัปเดต Activity Type เรียบร้อย');
    }

    public function destroy(ActivityType $activityType): RedirectResponse
    {
        // (ควรเพิ่ม Logic ตรวจสอบว่าถูกใช้งานหรือไม่)
        $activityType->delete();
        return redirect()->back()->with('success', 'ลบ Activity Type เรียบร้อย');
    }
}
