<?php

namespace Database\Factories;

use App\Models\Pedido;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Pedido> */
class PedidoFactory extends Factory
{
    protected $model = Pedido::class;

    public function definition(): array
    {
        return [
            'mesa_id' => null,
            'usuario_id' => null, // lo asigna el seeder
            'cliente_id' => null,
            'caja_id' => null,
            'estado' => 'pendiente',
            'total' => 0,
            'tipo_comprobante' => 'ticket',
            'nombre_cliente' => 'Público general',
            'metodo_pago' => 'efectivo',
            'estado_sunat' => 'PENDIENTE',
        ];
    }
}
