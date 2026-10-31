<?php

namespace Database\Seeders;

use App\Models\NotaCredito;
use App\Models\Pedido;
use App\Models\SerieDocumento;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

/** Una nota de crédito por cada uno de los 100 primeros ACEPTADOS. */
class NotaCreditoSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = Usuario::firstOrFail()->id;
        $motivos = [
            '01' => 'Anulación de la operación',
            '02' => 'Anulación por error en el RUC',
            '03' => 'Corrección por error en la descripción',
            '06' => 'Devolución total',
            '07' => 'Devolución parcial',
        ];

        $aceptados = Pedido::where('estado_sunat', 'ACEPTADO')->take(100)->get();

        foreach ($aceptados as $pedido) {
            $serie = $pedido->tipo_comprobante === 'factura' ? 'FC01' : 'BC01';
            $correlativo = SerieDocumento::siguiente($serie);
            $codigo = array_rand($motivos);

            NotaCredito::create([
                'pedido_id' => $pedido->id,
                'serie' => $serie,
                'correlativo' => $correlativo,
                'tipo_documento' => 'nota_credito',
                'codigo_motivo' => $codigo,
                'descripcion_motivo' => $motivos[$codigo],
                'subtotal' => $pedido->total,
                'igv' => $pedido->igv,
                'total' => $pedido->total,
                'estado_sunat' => 'ACEPTADO',
                'codigo_sunat' => '0',
                'descripcion_sunat' => 'Aceptado por SUNAT',
                'hash' => fake()->sha256(),
                'ruta_xml' => "sunat/xml/{$serie}-{$correlativo}.xml",
                'enviado_en' => $pedido->creado_en,
                'usuario_id' => $usuario,
                'creado_en' => $pedido->creado_en,
            ]);
        }
    }
}
