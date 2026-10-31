<?php

namespace Database\Seeders;

use App\Models\Pedido;
use App\Models\ResumenDiario;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * 100 resúmenes (uno por día) con totales agregados de las boletas
 * completadas de cada fecha de referencia.
 */
class ResumenDiarioSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = Usuario::firstOrFail()->id;

        for ($i = 1; $i <= 100; $i++) {
            $fecha = Carbon::today()->subDays($i)->toDateString();

            $boletas = Pedido::where('tipo_comprobante', 'boleta')
                ->where('estado', 'completada')
                ->whereDate('creado_en', $fecha)
                ->get();

            $estado = fake()->randomElement(['ACEPTADO', 'ACEPTADO', 'ACEPTADO', 'PENDIENTE', 'TICKET']);

            ResumenDiario::create([
                'fecha_referencia' => $fecha,
                'fecha_generacion' => $fecha,
                'correlativo' => 1,
                'identificador' => 'RC-' . Carbon::parse($fecha)->format('Ymd') . '-1',
                'total_documentos' => $boletas->count(),
                'monto_total' => round($boletas->sum('total'), 2),
                'estado_sunat' => $estado,
                'ticket' => $estado === 'TICKET' ? (string) fake()->unique()->numberBetween(100000, 999999) : null,
                'codigo_sunat' => $estado === 'ACEPTADO' ? '0' : null,
                'descripcion_sunat' => $estado === 'ACEPTADO' ? 'Aceptado por SUNAT' : null,
                'hash' => $estado === 'ACEPTADO' ? fake()->sha256() : null,
                'enviado_en' => $estado === 'PENDIENTE' ? null : $fecha,
                'consultado_en' => $estado === 'TICKET' ? $fecha : null,
                'usuario_id' => $usuario,
            ]);
        }
    }
}
