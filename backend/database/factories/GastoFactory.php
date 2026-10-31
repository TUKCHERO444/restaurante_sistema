<?php

namespace Database\Factories;

use App\Models\Gasto;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Gasto> */
class GastoFactory extends Factory
{
    protected $model = Gasto::class;

    public function definition(): array
    {
        return [
            'concepto' => fake()->randomElement([
                'Compra de verduras', 'Gas', 'Limpieza', 'Servilletas',
                'Carbón', 'Aceite', 'Envases delivery', 'Mantenimiento',
                'Bebidas', 'Especias', 'Pan', 'Lácteos',
            ]),
            'monto' => fake()->randomFloat(2, 5, 400),
            'usuario_id' => null, // lo asigna el seeder
            'caja_id' => null, // lo asigna el seeder
        ];
    }
}
