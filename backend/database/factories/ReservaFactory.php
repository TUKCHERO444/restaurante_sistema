<?php

namespace Database\Factories;

use App\Models\Reserva;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Reserva> */
class ReservaFactory extends Factory
{
    protected $model = Reserva::class;

    public function definition(): array
    {
        return [
            'nombre_cliente' => fake()->name(),
            'telefono' => fake()->phoneNumber(),
            'fecha_reserva' => fake()->dateTimeBetween('-15 days', '+30 days'),
            'personas' => fake()->numberBetween(1, 12),
            'mesa_id' => null,
            'nota' => fake()->boolean(30) ? fake()->sentence() : null,
            'estado' => fake()->randomElement(['pendiente', 'pendiente', 'confirmada', 'confirmada', 'cancelada']),
        ];
    }
}
