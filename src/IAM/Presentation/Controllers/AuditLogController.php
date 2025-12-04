<?php

namespace TmrEcosystem\IAM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use TmrEcosystem\IAM\Domain\Models\User; // <-- 1. Import User
use Spatie\QueryBuilder\QueryBuilder; // <-- 2. Import QueryBuilder
use Spatie\QueryBuilder\AllowedFilter; // <-- 3. Import AllowedFilter
use Illuminate\Http\Request; // <-- 4. Import Request
use Illuminate\Database\Eloquent\Builder;

class AuditLogController extends Controller
{
    /**
     * แสดงหน้าจอ Audit Log
     */
    // --- 5. (สำคัญ) แก้ไขเมธอด index ทั้งหมด ---
    public function index(Request $request): Response
    {
        $users = User::select('id', 'name')->get();

        $logs = QueryBuilder::for(Activity::class)
            // --- 2. (สำคัญ) แก้ไขส่วนนี้ ---
            ->allowedFilters([
                AllowedFilter::partial('description'),

                // (ของเดิม)
                // AllowedFilter::exact('causer_id'),

                // (ของใหม่)
                AllowedFilter::callback('causer_id', function (Builder $query, $value) {
                    // 2.1 ถ้าค่าที่ส่งมาไม่ใช่ "all" (เช่น "1", "2")
                    if ($value !== 'all') {
                        // 2.2 ให้กรองแบบ 'where' ปกติ
                        $query->where('causer_id', $value);
                    }
                    // 2.3 (ถ้า $value === 'all' ... ไม่ต้องทำอะไรเลย == ไม่กรอง)
                }),
            ])
            // --- สิ้นสุดการแก้ไข ---
            ->with('causer:id,name,email', 'subject')
            ->latest()
            ->paginate(25) // <-- (ผมปรับจาก 2 เป็น 25 นะครับ)
            ->withQueryString();

        return Inertia::render('IAM/AuditLog/Index', [
            'logs' => $logs,
            'users' => $users,
            'filters' => $request->query(),
        ]);
    }
}
