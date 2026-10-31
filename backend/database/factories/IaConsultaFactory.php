<?php

namespace Database\Factories;

use App\Models\IaConsulta;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<IaConsulta> */
class IaConsultaFactory extends Factory
{
    protected $model = IaConsulta::class;

    public function definition(): array
    {
        return [
            'usuario_id' => null, // lo asigna el seeder
            'pregunta' => fake()->randomElement([
                '¿Cuánto se vendió hoy?',
                'Top 5 platos más vendidos del mes',
                'Ventas por categoría esta semana',
                '¿Qué productos tienen stock bajo?',
                'Comparar ventas con el mes anterior',
                'Gastos del mes por concepto',
                'Rendimiento de mozos este mes',
                'Pedidos delivery de hoy por estado',
            ]),
            'titulo' => null,
            'sql_texto' => 'SELECT * FROM v_ia_ventas LIMIT 10',
            'grafico' => null,
            'favorito' => fake()->boolean(20),
            'veces' => fake()->numberBetween(1, 25),
            'creado_en' => fake()->dateTimeBetween('-90 days', 'now'),
            'ultimo_uso' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
