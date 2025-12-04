<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class CompanyScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // ตรวจสอบว่ามีผู้ใช้ล็อกอินอยู่หรือไม่
        if (Auth::check()) {

            /** @var \TmrEcosystem\IAM\Domain\Models\User $user */
            $user = Auth::user();

            // ถ้าผู้ใช้เป็น Super Admin ให้ออกจากการกรอง (เห็นทุกอย่าง)
            if ($user->hasRole('Super Admin')) {
                return;
            }

            // (สำคัญ) ดึงชื่อตารางจาก Model
            $tableName = $model->getTable();

            // ถ้าผู้ใช้ทั่วไป (ที่ไม่ใช่ Super Admin)
            // ให้กรองเฉพาะข้อมูลที่ 'company_id' ตรงกับของตัวเอง
            if ($user->company_id) {
                $builder->where($tableName . '.company_id', $user->company_id);
            } else {
                // ถ้า Admin ไม่มี company_id (ซึ่งไม่ควรเกิด) ให้เขาไม่เห็นอะไรเลย
                $builder->whereRaw('1 = 0');
            }
        }
    }
}
