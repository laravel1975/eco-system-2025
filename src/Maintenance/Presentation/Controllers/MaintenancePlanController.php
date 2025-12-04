<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use TmrEcosystem\Maintenance\Domain\Models\Asset;
use TmrEcosystem\Maintenance\Domain\Models\MaintenancePlan;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceType;

class MaintenancePlanController extends Controller
{
    /**
     * (Read) แสดงรายการ Maintenance Plans ทั้งหมด
     */
    public function index(Request $request)
    {
        // (เมธอด Index ไม่ได้ดึง Location - ไม่ต้องแก้ไข)
        $companyId = $request->user()->company_id;

        $plans = MaintenancePlan::where('company_id', $companyId)
            ->with(['asset:id,name', 'maintenanceType:id,name'])
            ->latest()
            ->paginate(15);

        return inertia('Maintenance/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    /**
     * (Create) แสดงฟอร์มสร้างแผน PM
     */
    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;

        // (👈 [แก้ไข] ดึง Asset พร้อม Warehouse (ใหม่))
        $assets = Asset::where('company_id', $companyId)
            ->where('status', 'active')
            ->with('warehouse:uuid,name') // (Ecosystem load Relation ใหม่)
            ->get(['id', 'name', 'asset_code', 'warehouse_uuid']); // (Select 'warehouse_uuid' แทน 'location')

        $pmTypes = MaintenanceType::where('company_id', $companyId)
            ->whereIn('code', ['PM', 'PDM'])
            ->get(['id', 'name']);

        return inertia('Maintenance/Plans/Create', [
            'assets' => $assets, // (ส่ง Asset (ใหม่) ไป Frontend)
            'pmTypes' => $pmTypes,
        ]);
    }

    /**
     * (Create) บันทึกแผน PM ใหม่
     */
    public function store(Request $request): RedirectResponse
    {
        // (เมธอด Store ไม่ต้องแก้ไข)
        // ... (โค้ดเดิม) ...
        $companyId = $request->user()->company_id;
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'asset_id' => ['required', Rule::exists('assets', 'id')->where('company_id', $companyId)],
            'maintenance_type_id' => ['required', Rule::exists('maintenance_types', 'id')->where('company_id', $companyId)],
            'interval_days' => 'required|integer|min:1',
            'next_due_date' => 'required|date|after_or_equal:today',
            'tasks' => 'present|array',
            'tasks.*.task_name' => 'required|string|max:255',
            'tasks.*.description' => 'nullable|string',
        ]);
        try {
            DB::beginTransaction();
            $plan = MaintenancePlan::create([
                'title' => $validated['title'],
                'asset_id' => $validated['asset_id'],
                'maintenance_type_id' => $validated['maintenance_type_id'],
                'interval_days' => $validated['interval_days'],
                'next_due_date' => $validated['next_due_date'],
                'company_id' => $companyId,
                'status' => 'active',
                'trigger_type' => 'TIME',
            ]);
            foreach ($validated['tasks'] as $index => $taskData) {
                $plan->tasks()->create([
                    'task_name' => $taskData['task_name'],
                    'description' => $taskData['description'] ?? null,
                    'sort_order' => $index + 1,
                ]);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการบันทึกแผน');
        }
        return redirect()->route('maintenance.plans.index')
            ->with('success', 'สร้างแผน PM เรียบร้อย');
    }

    /**
     * (Read) แสดงหน้ารายละเอียดแผน PM
     */
    public function show(Request $request, MaintenancePlan $plan)
    {
        // (เมธอด Show ไม่ต้องแก้ไข)
        $plan->load(['asset', 'maintenanceType', 'tasks']);
        return inertia('Maintenance/Plans/Show', [
            'plan' => $plan,
        ]);
    }

    /**
     * (Update) แสดงฟอร์มแก้ไขแผน PM
     */
    public function edit(Request $request, MaintenancePlan $plan)
    {
        $companyId = $request->user()->company_id;
        $plan->load('tasks');

        // (👈 [แก้ไข] ดึง Asset พร้อม Warehouse (ใหม่))
        $assets = Asset::where('company_id', $companyId)
            ->where('status', 'active')
            ->with('warehouse:uuid,name') // (Eager load Relation ใหม่)
            ->get(['id', 'name', 'asset_code', 'warehouse_uuid']); // (Select 'warehouse_uuid' แทน 'location')

        $pmTypes = MaintenanceType::where('company_id', $companyId)
            ->whereIn('code', ['PM', 'PDM'])
            ->get(['id', 'name']);

        return inertia('Maintenance/Plans/Edit', [
            'plan' => $plan,
            'assets' => $assets, // (ส่ง Asset (ใหม่) ไป Frontend)
            'pmTypes' => $pmTypes,
        ]);
    }

    /**
     * (Update) บันทึกการแก้ไขแผน PM
     */
    public function update(Request $request, MaintenancePlan $plan): RedirectResponse
    {
        // (เมธอด Update ไม่ต้องแก้ไข)
        // ... (โค้ดเดิม) ...
        $companyId = $request->user()->company_id;
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'asset_id' => ['required', Rule::exists('assets', 'id')->where('company_id', $companyId)],
            'maintenance_type_id' => ['required', Rule::exists('maintenance_types', 'id')->where('company_id', $companyId)],
            'interval_days' => 'required|integer|min:1',
            'next_due_date' => 'required|date',
            'status' => 'required|in:active,inactive',
            'tasks' => 'present|array',
            'tasks.*.task_name' => 'required|string|max:255',
            'tasks.*.description' => 'nullable|string',
        ]);
        try {
            DB::beginTransaction();
            $plan->update($validated);
            $plan->tasks()->delete();
            foreach ($validated['tasks'] as $index => $taskData) {
                $plan->tasks()->create([
                    'task_name' => $taskData['task_name'],
                    'description' => $taskData['description'] ?? null,
                    'sort_order' => $index + 1,
                ]);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการอัปเดตแผน');
        }
        return redirect()->route('maintenance.plans.index')
            ->with('success', 'อัปเดตแผน PM เรียบร้อย');
    }

    /**
     * (Delete) ลบแผน PM
     */
    public function destroy(MaintenancePlan $plan): RedirectResponse
    {
        // (เมธอด Destroy ไม่ต้องแก้ไข)
        $plan->delete();
        return redirect()->route('maintenance.plans.index')
            ->with('success', 'ลบแผน PM เรียบร้อย');
    }
}
