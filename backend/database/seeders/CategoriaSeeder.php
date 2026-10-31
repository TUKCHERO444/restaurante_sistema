<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $nombres = [
            'Entradas', 'Fondos', 'Bebidas', 'Postres', 'Ensaladas',
            'Sopas', 'Parrillas', 'Mariscos', 'Pollos', 'Pastas',
            'Desayunos', 'Cafetería', 'Jugos', 'Cervezas', 'Piqueos',
        ];

        foreach ($nombres as $nombre) {
            Categoria::firstOrCreate(['nombre' => $nombre]);
        }
    }
}
