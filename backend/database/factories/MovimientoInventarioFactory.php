<?php

namespace Database\Factories;

use App\Models\MovimientoInventario;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<MovimientoInventario> */
class MovimientoInventarioFactory extends Factory
{
    protected $model = MovimientoInventario::class;

    public function definition(): array
    {
        return [
            'producto_id' => null, // lo asigna el seeder
            'usuario_id' => null, // lo asigna el seeder
            'tipo' => 'ajuste',
            'cantidad' => 0,
            'stock_anterior' => null,
            'stock_nuevo' => null,
            'nota' => null,
        ];
    }
}
