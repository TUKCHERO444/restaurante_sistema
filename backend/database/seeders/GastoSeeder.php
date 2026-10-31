<?php

namespace Database\Seeders;

use App\Models\Caja;
use App\Models\Gasto;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class GastoSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = Usuario::firstOrFail()->id;
        $cajas = Caja::pluck('id')->all();

        for ($i = 0; $i < 100; $i++) {
            Gasto::create([
                'concepto' => fake()->randomElement([
                    'Compra de verduras', 'Gas', 'Limpieza', 'Servilletas',
                    'Carbón', 'Aceite', 'Envases delivery', 'Mantenimiento',
                    'Bebidas', 'Especias', 'Pan', 'Lácteos',
                ]),
                'monto' => fake()->randomFloat(2, 5, 400),
                'usuario_id' => $usuario,
                'caja_id' => $cajas[array_rand($cajas)],
                'creado_en' => fake()->dateTimeBetween('-60 days', 'now'),
            ]);
        }
    }
}
