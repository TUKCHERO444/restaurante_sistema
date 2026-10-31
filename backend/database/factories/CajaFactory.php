<?php

namespace Database\Factories;

use App\Models\Caja;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Caja> */
class CajaFactory extends Factory
{
    protected $model = Caja::class;

    public function definition(): array
    {
        $apertura = fake()->dateTimeBetween('-90 days', '-1 hour');
        $cerrada = fake()->boolean(85);

        return [
            'usuario_id' => Usuario::factory(),
            'apertura_en' => $apertura,
            'cierre_en' => $cerrada ? fake()->dateTimeBetween($apertura, 'now') : null,
            'monto_apertura' => $fondo = fake()->randomFloat(2, 100, 500),
            'monto_cierre' => $cerrada ? round($fondo + fake()->randomFloat(2, 0, 2000), 2) : null,
            'monto_esperado' => null,
            'diferencia' => null,
            'estado' => $cerrada ? 'cerrada' : 'abierta',
            'notas' => fake()->boolean(25) ? fake()->sentence() : null,
        ];
    }
}
