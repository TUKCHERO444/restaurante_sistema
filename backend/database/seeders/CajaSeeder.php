<?php

namespace Database\Seeders;

use App\Models\Caja;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class CajaSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = Usuario::firstOrFail()->id;

        // 99 turnos cerrados con montos coherentes
        for ($i = 0; $i < 99; $i++) {
            $apertura = fake()->dateTimeBetween('-90 days', '-2 days');
            $fondo = fake()->randomFloat(2, 100, 500);
            $ventas = fake()->randomFloat(2, 200, 3000);
            $gastos = fake()->randomFloat(2, 0, 300);
            $esperado = round($fondo + $ventas - $gastos, 2);
            $cierre = round($esperado + fake()->randomFloat(2, -20, 20), 2);

            Caja::create([
                'usuario_id' => $usuario,
                'apertura_en' => $apertura,
                'cierre_en' => fake()->dateTimeBetween($apertura, '-1 day'),
                'monto_apertura' => $fondo,
                'monto_cierre' => $cierre,
                'monto_esperado' => $esperado,
                'diferencia' => round($cierre - $esperado, 2),
                'estado' => 'cerrada',
            ]);
        }

        // 1 turno abierto vigente
        Caja::create([
            'usuario_id' => $usuario,
            'apertura_en' => now()->subHours(3),
            'monto_apertura' => 300,
            'estado' => 'abierta',
            'notas' => 'Turno de demostración',
        ]);
    }
}
