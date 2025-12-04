<?php

namespace TmrEcosystem\HRM\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use TmrEcosystem\HRM\Domain\Models\EmployeeProfile;
use TmrEcosystem\HRM\Domain\Models\EmergencyContact;
use TmrEcosystem\HRM\Presentation\Requests\StoreEmergencyContactRequest; // (เดี๋ยวเราจะสร้าง)

class EmployeeEmergencyContactController extends Controller
{
    /**
     * บันทึกผู้ติดต่อฉุกเฉินใหม่ (สำหรับพนักงานคนนั้นๆ)
     */
    public function store(StoreEmergencyContactRequest $request, EmployeeProfile $employee)
    {
        // $employee มาจาก Route-Model Binding (/{employee}/emergency-contacts)

        // (เราใช้ $request->validated() ที่มีการตรวจสอบสิทธิ์แล้ว)
        $employee->emergencyContacts()->create($request->validated());

        // (Inertia จะรีเฟรชหน้าอัตโนมัติ)
        return back()->with('success', 'Emergency contact added.');
    }

    /**
     * ลบผู้ติดต่อฉุกเฉิน
     */
    public function destroy(EmergencyContact $contact)
    {
        // (เราควรเช็คสิทธิ์ก่อนว่า ผู้ใช้ที่ล็อกอินอยู่ มีสิทธิ์ลบ contact นี้หรือไม่)
        // (เช่น $this->authorize('delete', $contact);)

        $contact->delete();

        return back()->with('success', 'Emergency contact removed.');
    }
}
