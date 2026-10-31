<?php

namespace App\Models;

class Reserva extends ModeloBase
{
    protected $table = 'reservas';

    protected $fillable = [
        'nombre_cliente',
        'telefono',
        'fecha_reserva',
        'personas',
        'mesa_id',
        'nota',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_reserva' => 'datetime',
            'personas' => 'integer',
        ];
    }

    public function mesa()
    {
        return $this->belongsTo(Mesa::class, 'mesa_id');
    }
}
