<?php

namespace Database\Factories;

use App\Models\NotaCredito;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<NotaCredito> */
class NotaCreditoFactory extends Factory
{
    protected $model = NotaCredito::class;

    public function definition(): array
    {
        return [
            'pedido_id' => null, // lo asigna el seeder
            'serie' => 'BC01',
            'correlativo' => null, // lo asigna el seeder (numeración atómica)
            'tipo_documento' => 'nota_credito',
            'codigo_motivo' => '01',
            'descripcion_motivo' => 'Anulación de la operación',
            'subtotal' => 0,
            'igv' => 0,
            'total' => 0,
            'estado_sunat' => 'PENDIENTE',
            'usuario_id' => null,
        ];
    }
}
