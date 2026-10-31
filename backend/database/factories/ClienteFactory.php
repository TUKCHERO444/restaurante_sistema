<?php

namespace Database\Factories;

use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Cliente> */
class ClienteFactory extends Factory
{
    protected $model = Cliente::class;

    public function definition(): array
    {
        $conDocumento = fake()->boolean(85);
        $esRuc = $conDocumento && fake()->boolean(25);

        return [
            'nombre' => fake()->name(),
            'tipo_documento' => ! $conDocumento ? 'ninguno' : ($esRuc ? 'RUC' : 'DNI'),
            'numero_documento' => ! $conDocumento
                ? null
                : ($esRuc
                    ? '20' . fake()->unique()->numerify('#########')
                    : fake()->unique()->numerify('########')),
            'correo' => fake()->boolean(60) ? fake()->unique()->safeEmail() : null,
            'telefono' => fake()->boolean(80) ? fake()->phoneNumber() : null,
            'direccion' => fake()->boolean(60) ? fake()->address() : null,
        ];
    }
}
