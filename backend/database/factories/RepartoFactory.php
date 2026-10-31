<?php

namespace Database\Factories;

use App\Models\Reparto;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Reparto> */
class RepartoFactory extends Factory
{
    protected $model = Reparto::class;

    public function definition(): array
    {
        return [
            'pedido_id' => null, // lo asigna el seeder
            'cliente_id' => null,
            'nombre_cliente' => fake()->name(),
            'telefono_cliente' => fake()->phoneNumber(),
            'direccion' => fake()->address(),
            'referencia' => fake()->boolean(40) ? fake()->sentence(4) : null,
            'repartidor_id' => null, // lo asigna el seeder
            'usuario_id' => null, // lo asigna el seeder
            'caja_id' => null,
            'estado' => 'pendiente',
            'metodo_pago' => 'efectivo',
            'costo_envio' => fake()->randomFloat(2, 0, 15),
            'notas' => null,
            'programado_para' => null,
            'entregado_en' => null,
        ];
    }
}
