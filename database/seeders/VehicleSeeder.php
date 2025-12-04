<?php
// เรียกใช้ :: php artisan db:seed --class="Database\Seeders\VehicleSeeder"

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
// ✅ Import Model จาก Namespace ที่ถูกต้องตามโครงสร้างของคุณ
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\Vehicle;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ใช้ Faker locale ไทย เพื่อให้ชื่อคนและเบอร์โทรดูสมจริง
        $faker = Faker::create('th_TH');

        // ข้อมูลตัวอย่างสำหรับสุ่ม
        $brands = ['Toyota', 'Isuzu', 'Hino', 'Mitsubishi', 'Honda', 'Nissan', 'Ford'];
        $vehicleTypes = ['truck_4w', 'truck_6w', 'truck_10w', 'pickup', 'van', 'bike'];
        $ownershipTypes = ['own', 'rented'];
        $statuses = ['active', 'active', 'active', 'maintenance', 'inactive']; // เน้น active เยอะหน่อย

        // สร้างรถจำลอง 20 คัน
        for ($i = 0; $i < 20; $i++) {

            // สุ่มรุ่นรถแบบง่ายๆ
            $model = $faker->randomElement(['Revo', 'D-Max', 'Ranger', 'Triton', 'Series-500', 'Elf']);

            Vehicle::create([
                'id' => Str::uuid(), // สร้าง UUID

                // สร้างทะเบียนรถไทยจำลอง (เช่น 1กข-1234)
                'license_plate' => $this->generateLicensePlate($faker),

                'brand' => $faker->randomElement($brands),
                'model' => $model,
                'vehicle_type' => $faker->randomElement($vehicleTypes),
                'ownership_type' => $faker->randomElement($ownershipTypes),

                // ข้อมูลคนขับ
                'driver_name' => $faker->name,
                'driver_phone' => $faker->phoneNumber,

                'status' => $faker->randomElement($statuses),
            ]);
        }

        $this->command->info('Seeded 20 Logistics Vehicles successfully!');
    }

    /**
     * Helper: สร้างเลขทะเบียนรถจำลองแบบไทย
     * รูปแบบ: [ตัวเลข 1 หลัก][พยัญชนะ 2 ตัว]-[ตัวเลข 4 หลัก]
     */
    private function generateLicensePlate($faker)
    {
        $thaiConsonants = [
            "ก", "ข", "ค", "ง", "จ", "ฉ", "ช", "ฌ", "ญ", "ฎ", "ฏ", "ฐ", "ฑ", "ฒ",
            "ณ", "ด", "ต", "ถ", "ท", "ธ", "น", "บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ภ",
            "ม", "ย", "ร", "ล", "ว", "ศ", "ษ", "ส", "ห", "ฬ", "อ", "ฮ"
        ];

        $prefixNum = $faker->numberBetween(1, 9);
        $char1 = $faker->randomElement($thaiConsonants);
        $char2 = $faker->randomElement($thaiConsonants);
        // ใช้ unique() กับตัวเลข 4 หลักเพื่อลดโอกาสซ้ำ (ถึงแม้จะไม่ 100% ถ้า run เยอะมากๆ แต่พอสำหรับ seed)
        $suffixNum = $faker->unique()->numberBetween(1000, 9999);

        return "{$prefixNum}{$char1}{$char2}-{$suffixNum}";
    }
}
