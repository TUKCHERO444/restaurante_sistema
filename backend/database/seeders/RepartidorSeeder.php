<?php

namespace Database\Seeders;

use App\Models\Repartidor;
use Illuminate\Database\Seeder;

class RepartidorSeeder extends Seeder
{
    public function run(): void
    {
        Repartidor::factory()->count(12)->create();
    }
}
