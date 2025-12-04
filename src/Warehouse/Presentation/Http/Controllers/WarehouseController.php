<?php

namespace TmrEcosystem\Warehouse\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Illuminate\Http\Request;
// (Application Layer)
use TmrEcosystem\Warehouse\Application\DTOs\WarehouseData;
use TmrEcosystem\Warehouse\Application\UseCases\CreateWarehouseUseCase;

// (Domain Layer)
use TmrEcosystem\Warehouse\Domain\Exceptions\WarehouseCodeAlreadyExistsException;
use TmrEcosystem\Warehouse\Domain\Repositories\WarehouseRepositoryInterface;
// (Presentation Layer)
use TmrEcosystem\Warehouse\Presentation\Http\Requests\CreateWarehouseRequest;

class WarehouseController extends Controller
{
    /**
     * (1) Inject Interface ผ่าน Constructor (เพื่อให้ใช้ได้ทั้งคลาส)
     */
    protected WarehouseRepositoryInterface $warehouseRepository;

    public function __construct(WarehouseRepositoryInterface $warehouseRepository)
    {
        $this->warehouseRepository = $warehouseRepository;
    }

    /**
     * (2) ▼▼▼ เมธอดใหม่ ▼▼▼
     * (READ) แสดงหน้า List ของ Warehouses
     */
    public function index(Request $request): Response
    {
        // (ดึง Company ID)
        $companyId = Auth::user()->company_id;

        // (ดึง Filters (เช่น ?search=... จาก URL))
        $filters = $request->only(['search']);

        // (เรียก Repository)
        $warehouses = $this->warehouseRepository->getPaginatedList($companyId, $filters);

        // (ส่งข้อมูล DTOs ไปให้ React Component)
        return Inertia::render('Warehouse/Index', [
            'warehouses' => $warehouses,
            'filters' => $filters,
        ]);
    }

    /**
     * (CREATE - Step 1)
     * แสดงหน้าฟอร์มสำหรับสร้าง Warehouse
     */
    public function create(): Response
    {
        // (เราจะสร้าง React Component นี้ในอนาคต)
        return Inertia::render('Warehouse/Create');
    }

    /**
     * (CREATE - Step 2)
     * บันทึก Warehouse ใหม่
     */
    public function store(
        CreateWarehouseRequest $request,
        CreateWarehouseUseCase $createWarehouse // (Inject Use Case)
    ): RedirectResponse {

        // (1) ดึงข้อมูลที่ Validate "รูปแบบ" แล้ว
        $validatedData = $request->validated();
        $companyId = Auth::user()->company_id;

        try {
            // (2) สร้าง DTO (กล่องข้อมูล)
            $warehouseData = new WarehouseData(
                companyId: $companyId,
                name: $validatedData['name'],
                code: $validatedData['code'],
                isActive: $validatedData['is_active'] ?? true, // (ค่าเริ่มต้นคือ Active)
                description: $validatedData['description'] ?? null
            );

            // (3) (หัวใจหลัก) เรียก Use Case "ผู้จัดการ"
            $newWarehouse = $createWarehouse($warehouseData);

            // (4) สำเร็จ: กลับไปหน้า List (สมมติ)
            return redirect()->route('warehouses.index') // (เราจะสร้างหน้านี้ทีหลัง)
                ->with('success', "Warehouse '{$newWarehouse->name()}' created.");
        } catch (WarehouseCodeAlreadyExistsException $e) {
            // (5) (Catch Error ทางธุรกิจ)
            return back()->withInput()->withErrors([
                'code' => $e->getMessage()
            ]);
        } catch (Exception $e) {
            // (6) (Catch Error ทั่วไป)
            Log::error('Failed to create warehouse: ' . $e->getMessage());
            return back()->withInput()->with('error', 'An unexpected error occurred.');
        }
    }

    // (เมธอด index, edit, update, destroy จะถูกสร้างในอนาคต)
}
