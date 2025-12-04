<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use TmrEcosystem\Maintenance\Domain\Models\Asset; // (1. ชี้ไปที่ Model ของคุณ)

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\TmrEcosystem\Maintenance\Domain\Models\Asset>
 */
class AssetFactory extends Factory
{
    /**
     * (2. ระบุ Model ที่ Factory นี้ใช้)
     */
    protected $model = Asset::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // (เราจะสร้าง asset_code ใน Seeder เพื่อการันตีว่าไม่ซ้ำ)
            'name' => $this->faker->words(3, true) . ' Machine',
            'description' => $this->faker->sentence(),
            'location' => 'Building ' . $this->faker->randomElement(['A', 'B', 'C']) . ' / Floor ' . $this->faker->numberBetween(1, 5),
            'model_number' => $this->faker->bothify('MOD-#####'),
            'serial_number' => $this->faker->unique()->ean13(),
            'purchase_date' => $this->faker->dateTimeBetween('-5 years', '-1 month'),
            'warranty_end_date' => $this->faker->dateTimeBetween('now', '+2 years'),
            'status' => $this->faker->randomElement(['active', 'active', 'active', 'inactive', 'in_repair']),

            // (company_id จะถูกกำหนดโดย Seeder)
        ];
    }
}
