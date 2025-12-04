<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use TmrEcosystem\Maintenance\Domain\Models\Asset;
use TmrEcosystem\Maintenance\Presentation\Requests\StoreAssetRequest;
use TmrEcosystem\Maintenance\Presentation\Requests\UpdateAssetRequest;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\WarehouseModel;

class AssetController extends Controller
{
    /**
     * (Read) แสดงรายการ Asset ทั้งหมด (หน้าตาราง Admin)
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $query = Asset::where('company_id', $companyId);

        // (ตัวอย่าง) เพิ่มการค้นหา
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('asset_code', 'like', '%' . $request->search . '%')
                    ->orWhere('location', 'like', '%' . $request->search . '%');
            });
        }

        $assets = $query->latest()->paginate(15);

        return inertia('Maintenance/Assets/Index', [
            'assets' => $assets,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * (Create) แสดงฟอร์มสำหรับสร้าง Asset
     */
    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;

        // (4. 👈 ดึง List Warehouse)
        $warehouses = WarehouseModel::where('company_id', $companyId)
            ->where('is_active', true)
            ->get(['uuid', 'name', 'code']);

        return inertia('Maintenance/Assets/Create', [
            'warehouses' => $warehouses // (5. 👈 ส่ง List ไปให้ React)
        ]);
    }

    /**
     * (Create) บันทึก Asset ใหม่ลง Database
     */
    public function store(StoreAssetRequest $request): RedirectResponse
    {
        $companyId = $request->user()->company_id;

        // (Request (ไฟล์ถัดไป) จะ Validate 'warehouse_uuid' แทน 'location')
        Asset::create($request->validated() + [
            'company_id' => $companyId,
            'status' => $request->status ?? 'active',
        ]);

        return redirect()->route('maintenance.assets.index')
                         ->with('success', 'สร้างทรัพย์สินเรียบร้อย');
    }

    /**
     * (Read) แสดงหน้ารายละเอียด Asset (รวมถึงประวัติการซ่อม)
     * (*** อัปเดตใหม่ ***)
     */
    public function show(Asset $asset)
    {
        // $this->authorize('view', $asset);
        $companyId = $asset->company_id; // (ดึง company_id จาก asset)

        // (1. โหลดข้อมูล Relation เหมือนเดิม)
        $asset->load([
            'workOrders' => fn($q) => $q->with('maintenanceType')->latest()->limit(20),
            'maintenanceRequests' => fn($q) => $q->with('requester')->latest()->limit(20),
        ]);

        // (2. [ใหม่] Logic สำหรับ Pager ... / ...)
        // (เราจะเรียงตาม ID - คุณสามารถเปลี่ยนเป็น 'asset_code' หรือ 'name' ได้)
        $query = Asset::where('company_id', $companyId)->orderBy('id', 'asc');

        // (ดึง ID ทั้งหมดมาเก็บไว้ใน Array)
        $allAssetIds = $query->pluck('id')->all();

        $currentIndex = array_search($asset->id, $allAssetIds);
        $total = count($allAssetIds);

        $nextId = $allAssetIds[$currentIndex + 1] ?? null;
        $prevId = $allAssetIds[$currentIndex - 1] ?? null;


        // (3. [ใหม่] ส่งข้อมูล 'paginationInfo' ไปยัง Inertia)
        return inertia('Maintenance/Assets/Show', [
            'asset' => $asset,
            'paginationInfo' => [
                'current_index' => $currentIndex + 1, // (แปลงเป็น 1-based index)
                'total' => $total,
                'next_asset_id' => $nextId,
                'prev_asset_id' => $prevId,
            ]
        ]);
    }

    /**
     * (Update) แสดงฟอร์มสำหรับแก้ไข Asset
     */
    public function edit(Request $request, Asset $asset) // (เพิ่ม Request)
    {
        $companyId = $request->user()->company_id;

        // (7. 👈 ดึง List Warehouse)
        $warehouses = WarehouseModel::where('company_id', $companyId)
            ->where('is_active', true)
            ->get(['uuid', 'name', 'code']);

        return inertia('Maintenance/Assets/Edit', [
            'asset' => $asset,
            'warehouses' => $warehouses // (8. 👈 ส่ง List ไปให้ React)
        ]);
    }

    /**
     * (Update) อัปเดตข้อมูล Asset ใน Database
     */
    public function update(UpdateAssetRequest $request, Asset $asset): RedirectResponse
    {
        // (Request (ไฟล์ถัดไป) จะ Validate 'warehouse_uuid' แทน 'location')
        $asset->update($request->validated());

        return redirect()->route('maintenance.assets.index')
                         ->with('success', 'อัปเดตทรัพย์สินเรียบร้อย');
    }

    /**
     * (Delete) ลบ Asset ออกจาก Database
     */
    public function destroy(Asset $asset): RedirectResponse
    {
        // $this->authorize('delete', $asset); // (Policy)

        // (สำคัญ) ตรวจสอบ Logic ของระบบ: ห้ามลบ Asset ที่มีประวัติการซ่อม
        if ($asset->workOrders()->exists() || $asset->maintenanceRequests()->exists()) {
            return redirect()->back()
                ->with('error', 'ไม่สามารถลบทรัพย์สินได้ เนื่องจากมีประวัติการซ่อม');
        }

        // (ถ้าไม่มีประวัติจริงๆ ก็ลบได้)
        $asset->delete();

        return redirect()->route('maintenance.assets.index')
            ->with('success', 'ลบทรัพย์สินเรียบร้อย');
    }
}
