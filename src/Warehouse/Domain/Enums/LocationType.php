<?php

namespace TmrEcosystem\Warehouse\Domain\Enums;

enum LocationType: string
{
    case PICKING = 'PICKING'; // พื้นที่สำหรับหยิบสินค้า (Active Picking)
    case BULK = 'BULK';       // พื้นที่เก็บสต็อกสำรอง (Buffer/Reserve)
    case RETURN = 'RETURN';   // พื้นที่รับคืนสินค้า (รอตรวจสอบ)
    case DAMAGED = 'DAMAGED'; // พื้นที่เก็บของเสีย (รอทำลาย/ส่งคืน Supplier)
    case INBOUND = 'INBOUND'; // พื้นที่รับของเข้า (Receiving Area)
    case OUTBOUND = 'OUTBOUND'; // พื้นที่วางของรอส่ง (Shipping Area)

    /**
     * คืนค่า Label ภาษาไทยสำหรับแสดงผลหน้าเว็บ
     */
    public function label(): string
    {
        return match($this) {
            self::PICKING => 'พื้นที่หยิบสินค้า (Picking)',
            self::BULK => 'พื้นที่เก็บสำรอง (Bulk Storage)',
            self::RETURN => 'พื้นที่รับคืน (Returns)',
            self::DAMAGED => 'ของเสีย/ชำรุด (Damaged)',
            self::INBOUND => 'จุดรับสินค้า (Receiving)',
            self::OUTBOUND => 'จุดรอส่งสินค้า (Shipping)',
        };
    }

    /**
     * Helper: คืนค่าสีสำหรับ Badge (ใช้ร่วมกับ ShadCN/Tailwind)
     */
    public function color(): string
    {
        return match($this) {
            self::PICKING => 'blue',    // สีฟ้า: หยิบง่าย
            self::BULK => 'gray',       // สีเทา: ของหนัก/เยอะ
            self::RETURN => 'orange',   // สีส้ม: รอตรวจสอบ
            self::DAMAGED => 'red',     // สีแดง: อันตราย/ห้ามใช้
            self::INBOUND => 'green',   // สีเขียว: ของใหม่เข้า
            self::OUTBOUND => 'purple', // สีม่วง: พร้อมออก
        };
    }

    /**
     * Helper: ดึงรายการทั้งหมดเป็น Array (สำหรับทำ Dropdown Option)
     * @return array<string, string> [value => label]
     */
    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[$case->value] = $case->label();
        }
        return $options;
    }
}
