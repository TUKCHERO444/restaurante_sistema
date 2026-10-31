<?php

namespace Database\Seeders;

use App\Models\Pedido;
use App\Models\Repartidor;
use App\Models\Reparto;
use Illuminate\Database\Seeder;

/** Un reparto por cada pedido delivery (relación 1:1). */
class RepartoSeeder extends Seeder
{
    public function run(): void
    {
        $repartidores = Repartidor::where('activo', true)->pluck('id')->all()
            ?: Repartidor::pluck('id')->all();

        $delivery = Pedido::whereNull('mesa_id')->get();

        foreach ($delivery as $pedido) {
            $estado = match ($pedido->estado) {
                'completada' => 'entregado',
                'anulada' => 'cancelado',
                default => fake()->randomElement(['pendiente', 'en_preparacion', 'en_camino']),
            };

            Reparto::create([
                'pedido_id' => $pedido->id,
                'cliente_id' => $pedido->cliente_id,
                'nombre_cliente' => $pedido->nombre_cliente,
                'telefono_cliente' => fake()->phoneNumber(),
                'direccion' => fake()->address(),
                'referencia' => fake()->boolean(40) ? fake()->sentence(4) : null,
                'repartidor_id' => $repartidores[array_rand($repartidores)],
                'usuario_id' => $pedido->usuario_id,
                'caja_id' => $pedido->caja_id,
                'estado' => $estado,
                'metodo_pago' => $pedido->metodo_pago === 'tarjeta' ? 'tarjeta' : fake()->randomElement(['efectivo', 'efectivo', 'transferencia']),
                'costo_envio' => fake()->randomFloat(2, 0, 15),
                'programado_para' => $pedido->creado_en,
                'entregado_en' => $estado === 'entregado' ? $pedido->creado_en : null,
                'creado_en' => $pedido->creado_en,
            ]);
        }
    }
}
