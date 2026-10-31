<?php

namespace Database\Factories;

use App\Models\Categoria;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Producto> */
class ProductoFactory extends Factory
{
    protected $model = Producto::class;

    public function definition(): array
    {
        $vendible = fake()->boolean(80);

        return [
            'categoria_id' => Categoria::factory(),
            'nombre' => fake()->unique()->words(2, true),
            'codigo' => 'P-' . fake()->unique()->numberBetween(1000, 99999),
            'codigo_barras' => fake()->boolean(60) ? fake()->unique()->ean13() : null,
            'precio' => fake()->randomFloat(2, 5, 120),
            'precio_promocional' => fake()->boolean(20) ? fake()->randomFloat(2, 3, 80) : null,
            'costo' => fake()->randomFloat(2, 1, 40),
            'stock' => $vendible && fake()->boolean(70) ? fake()->numberBetween(0, 100) : null,
            'vendible' => $vendible,
            'imagen' => null,
            'activo' => fake()->boolean(90),
            'recomendado_chef' => fake()->boolean(15),
            'nuevo' => fake()->boolean(15),
        ];
    }
}
