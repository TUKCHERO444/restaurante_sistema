<?php

namespace App\Models;

class Repartidor extends ModeloBase
{
    protected $table = 'repartidores';

    protected $fillable = [
        'nombre',
        'telefono',
        'activo',
    ];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }

    public function repartos()
    {
        return $this->hasMany(Reparto::class, 'repartidor_id');
    }
}
