<?php

namespace TmrEcosystem\IAM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use TmrEcosystem\IAM\Presentation\Requests\StoreRoleRequest;
use TmrEcosystem\IAM\Presentation\Requests\UpdateRoleRequest;

class RoleController extends Controller
{
    /**
     * แสดงหน้าจอรายการ Roles
     */
    public function index(): Response
    {
        $roles = Role::with('permissions:name')
                     ->select('id', 'name')
                     ->latest()
                     ->get();

        return Inertia::render('IAM/Roles/Index', [
            'roles' => $roles
        ]);
    }

    /**
     * แสดงหน้าฟอร์มสำหรับสร้าง Role
     */
    // --- 2. เพิ่มเมธอด create ---
    public function create(): Response
    {
        // (เฟส 1: เราแค่แสดงฟอร์ม)
        // (เฟส 2: เราจะส่ง 'permissions' ทั้งหมดมาที่นี่)
        return Inertia::render('IAM/Roles/Create');
    }

    /**
     * บันทึก Role ใหม่ลง Database
     */
    // --- 3. เพิ่มเมธอด store ---
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        // $request ผ่านการ validate แล้ว (จาก StoreRoleRequest)
        $validatedData = $request->validated();

        // สร้าง Role
        // (เราจะกำหนด 'guard_name' เป็น 'web' อัตโนมัติ)
        Role::create($validatedData);

        // ส่งกลับไปหน้า Index (Toast ของเราจะทำงานอัตโนมัติ)
        return redirect()->route('iam.roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * แสดงหน้าฟอร์มสำหรับแก้ไข Role
     */
    // --- 2. เพิ่มเมธอด edit ---
    public function edit(Role $role): Response
    {
        // 2.1 ดึง Permission ทั้งหมด (จัดกลุ่มตาม 'group_name' ถ้ามี)
        $permissions = Permission::select('id', 'name')->get();

        // 2.2 ดึง ID ของ Permission ที่ Role นี้มีอยู่แล้ว
        $rolePermissions = $role->permissions()->pluck('id')->toArray();
        return Inertia::render('IAM/Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions, // <-- 2.3 ส่ง Permission ทั้งหมด
            'rolePermissions' => $rolePermissions, // <-- 2.4 ส่ง Permission ของ Role นี้]);
        ]);
    }

    /**
     * อัปเดต Role ใน Database
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        if (in_array($role->name, ['Super Admin', 'Admin'])) {
            return redirect()->route('iam.roles.index')
                ->with('error', 'Cannot edit system roles.');
        }

        // 3. อัปเดตชื่อ Role
        $role->update($request->only('name')); // <-- อัปเดตเฉพาะ 'name'

        // 4. (Spatie) Sync Permissions
        // นี่คือหัวใจหลัก: Sync Permission ที่ส่งมาจากฟอร์ม
        $role->syncPermissions($request->input('permissions', []));

        return redirect()->route('iam.roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * ลบ Role ออกจาก Database
     */
    // --- 4. เพิ่มเมธอด destroy ---
    public function destroy(Role $role): RedirectResponse
    {
        // (ป้องกันการลบ Role พื้นฐานที่ระบบต้องใช้)
        if (in_array($role->name, ['Super Admin', 'Admin'])) {
            return redirect()->route('iam.roles.index')
                ->with('error', 'Cannot delete system roles.');
        }

        $role->delete();

        return redirect()->route('iam.roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
