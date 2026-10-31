<?php

namespace Database\Factories;

use App\Models\Configuracion;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Configuracion> */
class ConfiguracionFactory extends Factory
{
    protected $model = Configuracion::class;

    public function definition(): array
    {
        return [
            'clave' => fake()->unique()->slug(2),
            'valor' => fake()->sentence(),
        ];
    }
}
