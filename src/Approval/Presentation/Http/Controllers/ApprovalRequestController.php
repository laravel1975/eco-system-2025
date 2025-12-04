<?php

namespace TmrEcosystem\Approval\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use TmrEcosystem\Approval\Application\UseCases\ApproveRequestUseCase;
use TmrEcosystem\Approval\Application\UseCases\RejectRequestUseCase;
use TmrEcosystem\Approval\Domain\Models\ApprovalRequest;
use TmrEcosystem\Approval\Domain\Enums\ApprovalStatus;

class ApprovalRequestController extends Controller
{
    public function index()
    {
        // 1. ดึงรายการที่สถานะ Pending (ในอนาคตค่อยกรองตาม Role ของคน Login)
        //$approvals = ApprovalRequest::query()
        //    ->with(['workflow', 'requester']) // Eager Load ข้อมูลที่ต้องใช้แสดง
        //    ->where('status', 'pending')
        //    ->orderBy('created_at', 'desc')
        //    ->paginate(10);

        // เพิ่ม 'currentStep' เข้าไปใน with()
        $approvals = ApprovalRequest::query()
            ->with(['workflow', 'requester', 'currentStep']) // <--- เพิ่มตรงนี้
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // 2. ส่งข้อมูลไปที่หน้าเว็บ (React)
        return Inertia::render('Approval/Index', [
            'approvals' => $approvals
        ]);
    }

    public function action(
        Request $request,
        ApproveRequestUseCase $approveUseCase,
        RejectRequestUseCase $rejectUseCase
    ) {
        $request->validate([
            'request_id' => 'required',
            'action' => 'required|in:approve,reject',
            'comment' => 'nullable|string'
        ]);

        try {
            if ($request->action === 'approve') {
                $approveUseCase->handle(
                    requestId: $request->request_id,
                    actorId: Auth::id(),
                    comment: $request->comment
                );
                $message = 'อนุมัติรายการเรียบร้อย';
            } else {
                // ✅ เรียกใช้ Reject Logic ที่เพิ่งสร้าง
                $rejectUseCase->handle(
                    requestId: $request->request_id,
                    actorId: Auth::id(),
                    comment: $request->comment
                );
                $message = 'ปฏิเสธรายการเรียบร้อย';
            }

            // ส่งข้อความกลับไปบอก Frontend
            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'เกิดข้อผิดพลาด: ' . $e->getMessage());
        }
    }
}
