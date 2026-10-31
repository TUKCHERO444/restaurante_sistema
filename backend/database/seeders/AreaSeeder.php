<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        $nombres = [
            'Salón principal', 'Terraza', 'Zona VIP', 'Barra',
            'Segundo piso', 'Patio', 'Familiar', 'Ejecutivo',
            'Jardín', 'Balcón', 'Privado 1', 'Privado 2',
        ];

        foreach ($nombres as $nombre) {
            Area::firstOrCreate(['nombre' => $nombre]);
        }
    }
}
