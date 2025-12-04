<?php

namespace TmrEcosystem\Warehouse\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use TmrEcosystem\Warehouse\Application\DTOs\CreateLocationData;
use TmrEcosystem\Warehouse\Application\UseCases\CreateStorageLocationUseCase;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\StorageLocationModel;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\WarehouseModel;
// (Optional) Import Enum ถ้าต้องการส่ง options ไปให้ Frontend
use TmrEcosystem\Warehouse\Domain\Enums\LocationType;

class StorageLocationController extends Controller
{
    /**
     * แสดงรายการ Location ของ Warehouse นั้นๆ
     */
    public function index(string $warehouseUuid)
    {
        $warehouse = WarehouseModel::where('uuid', $warehouseUuid)->firstOrFail();

        $locations = StorageLocationModel::where('warehouse_uuid', $warehouseUuid)
            ->orderBy('code')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Warehouse/Locations/Index', [
            'warehouse' => $warehouse,
            'locations' => $locations
        ]);
    }

    /**
     * ✅ [เพิ่มใหม่] แสดงหน้าฟอร์มสร้าง Location
     */
    public function create(string $warehouseUuid)
    {
        $warehouse = WarehouseModel::where('uuid', $warehouseUuid)->firstOrFail();

        return Inertia::render('Warehouse/Locations/Create', [
            'warehouse' => $warehouse,
            // ถ้าต้องการส่ง Enum ไปให้ Frontend ใช้สร้าง Dropdown
            'locationTypes' => LocationType::cases(),
        ]);
    }

    /**
     * บันทึก Location ใหม่
     */
    public function store(
        Request $request,
        string $warehouseUuid,
        CreateStorageLocationUseCase $useCase
    ) {
        $request->validate([
            'code' => 'required|string|max:50', // e.g., A-01-01
            'type' => 'required|in:PICKING,BULK,RETURN,DAMAGED,INBOUND,OUTBOUND', // ตรงกับ Enum
            'description' => 'nullable|string',
        ]);

        try {
            $dto = new CreateLocationData(
                warehouseUuid: $warehouseUuid,
                code: $request->code,
                barcode: $request->barcode ?? $request->code, // ถ้าไม่กรอก ใช้ code เป็น barcode
                type: $request->type,
                description: $request->description
            );

            $useCase($dto);

            return to_route('warehouses.locations.index', $warehouseUuid)
                ->with('success', 'Location created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['code' => $e->getMessage()]);
        }
    }
}
