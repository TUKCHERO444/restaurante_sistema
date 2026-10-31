<?php

namespace Database\Seeders;

use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

/** Kardex con matemática de stock coherente (actualiza el producto). */
class MovimientoInventarioSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = Usuario::firstOrFail()->id;
        $productos = Producto::all();

        for ($i = 0; $i < 100; $i++) {
            /** @var Producto $producto */
            $producto = $productos->random();
            $tipo = fake()->randomElement(['compra', 'compra', 'venta', 'venta', 'ajuste']);
            $anterior = $producto->stock;

            if ($anterior === null) {
                $cantidad = $tipo === 'venta' ? -fake()->numberBetween(1, 5) : fake()->numberBetween(1, 20);
                $nuevo = null; // ilimitado: no se controla
            } elseif ($tipo === 'venta') {
                if ($anterior <= 0) {
                    $tipo = 'compra'; // sin stock: entra mercadería en vez de salir
                    $cantidad = fake()->numberBetween(10, 50);
                    $nuevo = $anterior + $cantidad;
                } else {
                    $cantidad = -fake()->numberBetween(1, min(5, $anterior));
                    $nuevo = $anterior + $cantidad;
                }
            } elseif ($tipo === 'compra') {
                $cantidad = fake()->numberBetween(10, 50);
                $nuevo = $anterior + $cantidad;
            } else {
                $cantidad = fake()->numberBetween(-5, 5) ?: 1;
                $nuevo = max(0, $anterior + $cantidad);
            }

            MovimientoInventario::create([
                'producto_id' => $producto->id,
                'usuario_id' => $usuario,
                'tipo' => $tipo,
                'cantidad' => $cantidad,
                'stock_anterior' => $anterior,
                'stock_nuevo' => $nuevo,
                'nota' => $tipo === 'ajuste' ? 'Ajuste de inventario' : null,
                'creado_en' => fake()->dateTimeBetween('-60 days', 'now'),
            ]);

            if ($nuevo !== null) {
                $producto->stock = $nuevo;
                $producto->save();
            }
        }
    }
}
