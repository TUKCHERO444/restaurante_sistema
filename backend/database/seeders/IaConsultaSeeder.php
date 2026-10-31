<?php

namespace Database\Seeders;

use App\Models\IaConsulta;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class IaConsultaSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = Usuario::firstOrFail()->id;

        IaConsulta::factory()->count(100)->create(['usuario_id' => $usuario]);
    }
}
