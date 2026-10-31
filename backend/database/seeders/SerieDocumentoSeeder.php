<?php

namespace Database\Seeders;

use App\Models\SerieDocumento;
use Illuminate\Database\Seeder;

/**
 * Talonarios iniciales de comprobantes (B001/F001/BC01/FC01).
 * Es configuración requerida del sistema, no datos demo.
 */
class SerieDocumentoSeeder extends Seeder
{
    public function run(): void
    {
        $series = [
            ['codigo_documento' => '03', 'tipo_documento' => 'boleta', 'serie' => 'B001'],
            ['codigo_documento' => '01', 'tipo_documento' => 'factura', 'serie' => 'F001'],
            ['codigo_documento' => '07', 'tipo_documento' => 'nota_credito_boleta', 'serie' => 'BC01'],
            ['codigo_documento' => '07', 'tipo_documento' => 'nota_credito_factura', 'serie' => 'FC01'],
        ];

        foreach ($series as $serie) {
            SerieDocumento::firstOrCreate(['serie' => $serie['serie']], $serie);
        }
    }
}
