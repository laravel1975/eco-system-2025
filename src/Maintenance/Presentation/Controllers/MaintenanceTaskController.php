<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceTask;

class MaintenanceTaskController extends Controller
{
    public function toggle(MaintenanceTask $task)
    {
        // สลับสถานะ true <-> false
        $task->update([
            'is_checked' => !$task->is_checked
        ]);

        return redirect()->back(); // กลับไปหน้าเดิม (Inertia จะรีโหลดข้อมูลใหม่ให้)
    }
}
