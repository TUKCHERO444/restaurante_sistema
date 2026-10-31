<?php

namespace Database\Factories;

use App\Models\Repartidor;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Repartidor> */
class RepartidorFactory extends Factory
{
    protected $model = Repartidor::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->name(),
            'telefono' => fake()->phoneNumber(),
            'activo' => fake()->boolean(80),
        ];
    }
}
