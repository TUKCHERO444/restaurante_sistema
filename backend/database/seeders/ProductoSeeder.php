<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Producto;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = Categoria::pluck('id')->all();
        $platos = [
            'Lomo saltado', 'Ceviche', 'Ají de gallina', 'Pollo a la brasa',
            'Arroz con pollo', 'Tallarines verdes', 'Pachamanca', 'Rocoto relleno',
            'Anticuchos', 'Papa a la huancaína', 'Causa limeña', 'Chicharrón',
            'Trucha frita', 'Seco de res', 'Carapulcra', 'Arroz chaufa',
            'Pollo broaster', 'Hamburguesa', 'Pizza familiar', 'Ensalada César',
        ];

        // 80 vendibles (round-robin por categoría para cubrirlas todas)
        for ($i = 0; $i < 80; $i++) {
            $precio = fake()->randomFloat(2, 8, 60);
            Producto::create([
                'categoria_id' => $categorias[$i % count($categorias)],
                'nombre' => ($platos[$i % count($platos)]) . ($i >= count($platos) ? ' ' . ($i + 1) : ''),
                'codigo' => 'P-' . (1000 + $i),
                'codigo_barras' => $i % 2 === 0 ? fake()->unique()->ean13() : null,
                'precio' => $precio,
                'precio_promocional' => fake()->boolean(20) ? round($precio * 0.85, 2) : null,
                'costo' => round($precio * 0.4, 2),
                'stock' => fake()->boolean(70) ? fake()->numberBetween(0, 100) : null,
                'vendible' => true,
                'activo' => fake()->boolean(90),
                'recomendado_chef' => fake()->boolean(15),
                'nuevo' => fake()->boolean(15),
            ]);
        }

        // 20 insumos (no vendibles, con stock controlado)
        $insumos = [
            'Pollo entero', 'Carne de res', 'Pescado', 'Arroz', 'Papa',
            'Cebolla', 'Tomate', 'Aceite', 'Leche', 'Queso',
            'Huevos', 'Harina', 'Azúcar', 'Sal', 'Pimienta',
            'Ají amarillo', 'Limón', 'Culantro', 'Fideos', 'Gaseosa',
        ];

        foreach ($insumos as $j => $nombre) {
            Producto::create([
                'categoria_id' => $categorias[$j % count($categorias)],
                'nombre' => $nombre,
                'codigo' => 'I-' . (1000 + $j),
                'precio' => 0,
                'costo' => fake()->randomFloat(2, 1, 20),
                'stock' => fake()->numberBetween(10, 200),
                'vendible' => false,
                'activo' => true,
            ]);
        }
    }
}
