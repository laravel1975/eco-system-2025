<?php

namespace TmrEcosystem\IAM\Domain\Models;

use Spatie\Permission\Models\Role as SpatieRole; // <-- 1. Import ตัวหลัก
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

// --- 2. (สำคัญ) extends SpatieRole ---
class Role extends SpatieRole
{
    // --- 3. เพิ่ม Trait ---
    use LogsActivity;

    // --- 4. เพิ่มฟังก์ชันนี้ (สำหรับตั้งค่า Log) ---
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // 1. บันทึกเฉพาะ 'name' และ 'permissions'
            // (เราลบ logAttributes(['name']) ที่ซ้ำซ้อนออก)
            ->logOnly(['name', 'permissions'])
            // 2. บันทึกเฉพาะเมื่อมีการเปลี่ยนแปลง
            ->logOnlyDirty()
            // 3. ไม่ต้องบันทึกถ้ามีแค่ 'updated_at' ที่เปลี่ยน
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->setDescriptionForEvent(fn(string $eventName) => "Role [{$this->name}] has been {$eventName}");
    }
}
