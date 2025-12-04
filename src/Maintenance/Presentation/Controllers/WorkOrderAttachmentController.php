<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrderAttachment;
// (อาจจะต้องใช้ Storage facade)
// use Illuminate\Support\Facades\Storage;

class WorkOrderAttachmentController extends Controller
{
    /**
     * (Feature D) อัปโหลดไฟล์แนบ
     */
    public function store(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        // $this->authorize('addAttachment', $workOrder);

        $validated = $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,xlsx|max:10240', // (10MB)
            'description' => 'nullable|string|max:255',
        ]);

        // (Logic การอัปโหลดไฟล์ไปที่ S3 หรือ local storage)
        // $path = $validated['file']->store('work-orders/attachments', 'public');
        $path = 'dummy/path/' . $validated['file']->getClientOriginalName();
        $originalName = $validated['file']->getClientOriginalName();

        // (บันทึก Path ลง DB - (เรายังไม่ได้สร้าง Model/Migration นี้))
        // WorkOrderAttachment::create([
        //     'work_order_id' => $workOrder->id,
        //     'file_path' => $path,
        //     'file_name' => $originalName,
        //     'description' => $validated['description'],
        //     'uploaded_by_user_id' => $request->user()->id,
        // ]);

        return redirect()->back()->with('success', 'อัปโหลดไฟล์แนบเรียบร้อย');
    }

    /**
     * (Feature D) ลบไฟล์แนบ
     */
    public function destroy(WorkOrder $workOrder, WorkOrderAttachment $attachment): RedirectResponse
    {
        // $this->authorize('deleteAttachment', $workOrder);

        // (1. ลบไฟล์ออกจาก Storage)
        // Storage::disk('public')->delete($attachment->file_path);

        // (2. ลบข้อมูลออกจาก DB)
        // $attachment->delete();

        return redirect()->back()->with('success', 'ลบไฟล์แนบเรียบร้อย');
    }
}
