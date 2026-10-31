<?php

namespace App\Models;

class Categoria extends ModeloBase
{
    protected $table = 'categorias';

    protected $fillable = [
        'nombre',
        'imagen',
        'activo',
    ];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }

    public function productos()
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }
}
