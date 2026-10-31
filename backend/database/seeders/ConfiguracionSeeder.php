<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use Illuminate\Database\Seeder;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        $valores = [
            // Empresa
            'company_name' => 'Restaurante Demo S.A.C.',
            'company_phone' => '01-555-0134',
            'company_address' => 'Av. Principal 123, Lima',
            'company_logo' => null,
            'timezone' => 'America/Lima',
            'currency_symbol' => 'S/',
            'ticket_footer' => 'Gracias por su visita',
            // SUNAT
            'sunat_ruc' => '20123456789',
            'sunat_razon_social' => 'Restaurante Demo S.A.C.',
            'sunat_nombre_comercial' => 'Restaurante Demo',
            'sunat_direccion_fiscal' => 'Av. Principal 123, Lima',
            'sunat_ubigeo' => '150101',
            'sunat_departamento' => 'Lima',
            'sunat_provincia' => 'Lima',
            'sunat_distrito' => 'Lima',
            'sunat_urbanizacion' => null,
            'sunat_environment' => 'beta',
            'sunat_igv_rate' => '18',
            'sunat_sol_user' => 'MODDATOS',
            'sunat_sol_pass' => 'moddatos',
            'sunat_cert_password' => null,
            // Operación
            'meta_diaria' => '5000',
            'propina_sugerida' => '10',
            'costo_delivery_base' => '5',
            'mensaje_bienvenida' => 'Bienvenidos',
            'moneda' => 'PEN',
        ];

        foreach ($valores as $clave => $valor) {
            Configuracion::updateOrCreate(['clave' => $clave], ['valor' => $valor]);
        }
    }
}
