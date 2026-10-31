<?php

namespace Database\Factories;

use App\Models\ResumenDiario;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ResumenDiario> */
class ResumenDiarioFactory extends Factory
{
    protected $model = ResumenDiario::class;

    public function definition(): array
    {
        return [
            'fecha_referencia' => fake()->date(),
            'fecha_generacion' => fake()->date(),
            'correlativo' => 1,
            'identificador' => 'RC-00000000-1',
            'total_documentos' => 0,
            'monto_total' => 0,
            'estado_sunat' => 'PENDIENTE',
            'usuario_id' => null,
        ];
    }
}
