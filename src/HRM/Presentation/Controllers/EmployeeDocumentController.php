<?php

namespace TmrEcosystem\HRM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // (Import Storage)
use Inertia\Inertia;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use TmrEcosystem\HRM\Domain\Models\EmployeeDocument;
use TmrEcosystem\HRM\Presentation\Requests\StoreEmployeeDocumentRequest;

class EmployeeDocumentController extends Controller
{

    public function dashboard(){
        return Inertia::render('HRM/Dashboard');
    }

    /**
     * อัปโหลดและบันทึกเอกสารใหม่
     */
    public function store(StoreEmployeeDocumentRequest $request, EmployeeProfile $employee)
    {
        $file = $request->file('document');
        $validated = $request->validated();

        $userID = Auth::user()->id;

        // 1. สร้าง Path ที่ปลอดภัย (แยกตามบริษัท และ ID พนักงาน)
        $companyId = $employee->company_id;
        $directory = "documents/company_{$companyId}/employee_{$employee->id}";

        // 2. อัปโหลดไฟล์ไปที่ 'private_docs' disk
        $path = $file->store($directory, 'private_docs');

        // 3. บันทึกข้อมูลลง Database
        $employee->documents()->create([
            'company_id' => $companyId,
            'uploaded_by_user_id' => $userID,
            'title' => $validated['title'],
            'document_type' => $validated['document_type'],
            'expires_at' => $validated['expires_at'] ?? null,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return back()->with('success', 'Document uploaded.');
    }

    /**
     * ลบเอกสาร
     */
    public function destroy(EmployeeDocument $document)
    {
        // (ควรเช็คสิทธิ์ก่อน)
        // $this->authorize('delete', $document);

        // 1. ลบไฟล์ออกจาก Storage
        Storage::disk('private_docs')->delete($document->file_path);

        // 2. ลบข้อมูลออกจาก Database
        $document->delete();

        return back()->with('success', 'Document removed.');
    }

    /**
     * (โบนัส) ดาวน์โหลดไฟล์อย่างปลอดภัย
     */
    public function download(EmployeeDocument $document)
    {
        // (ควรเช็คสิทธิ์ก่อน)
        // $this->authorize('view', $document);

        // ตรวจสอบว่าไฟล์มีอยู่จริง
        if (!Storage::disk('private_docs')->exists($document->file_path)) {
            return back()->with('error', 'File not found.');
        }

        // ส่งไฟล์ให้เบราว์เซอร์ดาวน์โหลด (ด้วยชื่อเดิม)
        return Storage::disk('private_docs')->download($document->file_path, $document->file_name);
    }
}
