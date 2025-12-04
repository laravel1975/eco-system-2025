<?php

namespace TmrEcosystem\Approval\Application\UseCases;

use TmrEcosystem\Approval\Domain\Models\ApprovalRequest;
use TmrEcosystem\Approval\Domain\Enums\ApprovalStatus;
use Illuminate\Support\Facades\DB;

class RejectRequestUseCase
{
    public function handle(string $requestId, int|string $actorId, ?string $comment = null)
    {
        return DB::transaction(function () use ($requestId, $actorId, $comment) {
            // 1. ดึงข้อมูลและล็อคแถว
            $request = ApprovalRequest::lockForUpdate()->findOrFail($requestId);

            // 2. อัปเดตสถานะเป็น Rejected (จบ Flow ทันที)
            $request->update([
                'status' => ApprovalStatus::REJECTED
            ]);

            // 3. บันทึก Log การปฏิเสธ
            $request->actions()->create([
                'actor_id' => $actorId,
                'action' => 'reject',
                'comment' => $comment
            ]);

            // TODO: (Optional) ส่ง Notification แจ้งเตือนผู้ขอว่า "โดนตีกลับ"

            return $request;
        });
    }
}
