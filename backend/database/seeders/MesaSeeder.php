<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Mesa;
use Illuminate\Database\Seeder;

class MesaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = Area::pluck('id')->all();

        for ($i = 1; $i <= 100; $i++) {
            Mesa::create([
                'area_id' => $areas[array_rand($areas)],
                'nombre' => 'M-' . $i,
                'asientos' => fake()->randomElement([2, 4, 4, 6, 8]),
                'estado' => fake()->randomElement(['libre', 'libre', 'libre', 'ocupada', 'reservada']),
                'pos_x' => fake()->numberBetween(0, 800),
                'pos_y' => fake()->numberBetween(0, 600),
            ]);
        }
    }
}
