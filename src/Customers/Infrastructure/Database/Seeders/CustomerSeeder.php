<?php
// เรียกใช้งาน :: php artisan db:seed --class="TmrEcosystem\Customers\Infrastructure\Database\Seeders\CustomerSeeder"

namespace TmrEcosystem\Customers\Infrastructure\Database\Seeders;

use Illuminate\Database\Seeder;
use TmrEcosystem\Customers\Infrastructure\Persistence\Models\Customer;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        Customer::create([
            'code' => 'C001',
            'name' => 'บริษัท ตัวอย่าง จำกัด',
            'tax_id' => '1234567890123',
            'address' => '123 ถ.สุขุมวิท กทม.',
            'credit_term' => '30 Days'
        ]);

        Customer::create([
            'code' => 'C002',
            'name' => 'ร้านค้า ปลีกย่อย (สด)',
            'tax_id' => '0987654321098',
            'address' => 'ตลาดไท ปทุมธานี',
            'credit_term' => 'Cash'
        ]);

        // สร้างเพิ่มอีก 5 รายการ
        for ($i = 3; $i <= 7; $i++) {
            Customer::create([
                'code' => 'C00' . $i,
                'name' => 'ลูกค้า ทดสอบรายที่ ' . $i,
                'address' => 'ที่อยู่ทดสอบ ' . $i,
            ]);
        }
    }
}
