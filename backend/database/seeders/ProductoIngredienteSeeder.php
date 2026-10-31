<?php

namespace Database\Seeders;

use App\Models\Producto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductoIngredienteSeeder extends Seeder
{
    public function run(): void
    {
        $platos = Producto::where('vendible', true)->pluck('id')->all();
        $insumos = Producto::where('vendible', false)->pluck('id')->all();
        $existentes = [];
        $creadas = 0;
        $intentos = 0;

        while ($creadas < 100 && $intentos < 1000) {
            $intentos++;
            $plato = $platos[array_rand($platos)];
            $insumo = $insumos[array_rand($insumos)];

            if ($plato === $insumo || isset($existentes[$plato . '-' . $insumo])) {
                continue;
            }

            $existentes[$plato . '-' . $insumo] = true;

            DB::table('producto_ingredientes')->insert([
                'producto_id' => $plato,
                'ingrediente_id' => $insumo,
                'cantidad' => fake()->randomFloat(2, 0.1, 5),
                'creado_en' => now(),
                'actualizado_en' => now(),
            ]);
            $creadas++;
        }
    }
}
