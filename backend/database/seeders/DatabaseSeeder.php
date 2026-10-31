<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SerieDocumentoSeeder::class,
        ]);

        Usuario::firstOrCreate(
            ['correo' => 'prueba@ejemplo.com'],
            ['nombre' => 'Usuario de prueba', 'contrasena' => 'contrasena', 'rol' => 'administrador'],
        );

        // Catálogos y maestros
        $this->call([
            AreaSeeder::class,
            CategoriaSeeder::class,
            MesaSeeder::class,
            ProductoSeeder::class,
            ProductoIngredienteSeeder::class,
            ClienteSeeder::class,
            RepartidorSeeder::class,
            CajaSeeder::class,
            ReservaSeeder::class,
        ]);

        // Proceso de negocio (en orden de dependencias)
        $this->call([
            PedidoSeeder::class, // 100 salón + 100 delivery (+ líneas y totales)
            RepartoSeeder::class, // 1:1 con pedidos delivery
            GastoSeeder::class,
            MovimientoInventarioSeeder::class,
            NotaCreditoSeeder::class, // sobre ACEPTADOS
            ResumenDiarioSeeder::class, // agregados por fecha
        ]);

        // Configuración y asistente
        $this->call([
            ConfiguracionSeeder::class,
            IaConsultaSeeder::class,
        ]);
    }
}
