<?php

namespace Database\Factories;

use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PedidoDetalle> */
class PedidoDetalleFactory extends Factory
{
    protected $model = PedidoDetalle::class;

    public function definition(): array
    {
        return [
            'pedido_id' => Pedido::factory(),
            'producto_id' => Producto::factory(),
            'cantidad' => fake()->numberBetween(1, 3),
            'precio' => fake()->randomFloat(2, 5, 120),
            'nota' => fake()->boolean(20) ? fake()->sentence(3) : null,
            'estado' => 'pendiente',
        ];
    }
}
