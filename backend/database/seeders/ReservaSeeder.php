<?php

namespace Database\Seeders;

use App\Models\Mesa;
use App\Models\Reserva;
use Illuminate\Database\Seeder;

class ReservaSeeder extends Seeder
{
    public function run(): void
    {
        $mesas = Mesa::pluck('id')->all();

        for ($i = 0; $i < 100; $i++) {
            $confirmada = fake()->boolean(60);

            Reserva::create([
                'nombre_cliente' => fake()->name(),
                'telefono' => fake()->phoneNumber(),
                'fecha_reserva' => fake()->dateTimeBetween('-15 days', '+30 days'),
                'personas' => fake()->numberBetween(1, 12),
                'mesa_id' => $confirmada ? $mesas[array_rand($mesas)] : null,
                'nota' => fake()->boolean(30) ? fake()->sentence() : null,
                'estado' => $confirmada
                    ? 'confirmada'
                    : fake()->randomElement(['pendiente', 'pendiente', 'cancelada']),
            ]);
        }
    }
}
