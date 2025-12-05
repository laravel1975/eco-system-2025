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
    public function index(Request $request)
    {
        $user = Auth::user();

        // 1. รับค่า Filter
        $search = $request->input('search');
        $status = $request->input('status', 'pending'); // Default เป็น pending (งานค้าง)

        // 2. Query หลัก
        $query = ApprovalRequest::query()
            ->with(['workflow', 'requester', 'currentStep']);

        // 3. Apply Filters
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('document_number', 'like', "%{$search}%")
                    ->orWhere('subject_id', 'like', "%{$search}%")
                    ->orWhereHas('requester', function ($subQ) use ($search) {
                        $subQ->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // 4. Pagination
        $approvals = $query->orderBy('created_at', 'desc')->paginate(10);

        // 5. คำนวณ Stats (KPIs)
        $stats = [
            'total_pending' => ApprovalRequest::where('status', 'pending')->count(),
            'my_tasks'      => ApprovalRequest::where('status', 'pending')
                ->whereHas('currentStep', function ($q) {
                    // TODO: กรองตาม Role ของ User จริงๆ
                    // $q->whereIn('approver_role', Auth::user()->getRoleNames());
                })->count(),
            'completed'     => ApprovalRequest::whereIn('status', ['approved', 'rejected'])->count()
        ];

        return Inertia::render('Approval/Index', [
            'approvals' => $approvals,
            'filters'   => [
                'search' => $search,
                'status' => $status,
            ],
            'stats'     => $stats
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

    public function show($id)
    {
        $request = ApprovalRequest::with([
            'workflow',
            'requester.employeeProfile.position', // ดึงตำแหน่งผู้ขอ
            'currentStep',
            'actions.actor.employeeProfile' // ดึงลายเซ็นผู้อนุมัติเก่าๆ
        ])->findOrFail($id);

        return Inertia::render('Approval/Show', [
            'request' => $request
        ]);
    }
}
