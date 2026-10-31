<?php

namespace Database\Factories;

use App\Models\Area;
use App\Models\Mesa;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Mesa> */
class MesaFactory extends Factory
{
    protected $model = Mesa::class;

    public function definition(): array
    {
        return [
            'area_id' => Area::factory(),
            'nombre' => 'M-' . fake()->unique()->numberBetween(1, 999),
            'asientos' => fake()->randomElement([2, 4, 4, 6, 8]),
            'estado' => fake()->randomElement(['libre', 'libre', 'libre', 'ocupada', 'reservada']),
            'pos_x' => fake()->numberBetween(0, 800),
            'pos_y' => fake()->numberBetween(0, 600),
        ];
    }
}
