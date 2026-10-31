<?php

namespace App\Models;

class Mesa extends ModeloBase
{
    protected $table = 'mesas';

    protected $fillable = [
        'area_id',
        'nombre',
        'asientos',
        'estado',
        'pos_x',
        'pos_y',
    ];

    protected function casts(): array
    {
        return [
            'asientos' => 'integer',
            'pos_x' => 'integer',
            'pos_y' => 'integer',
        ];
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'mesa_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'mesa_id');
    }
}
