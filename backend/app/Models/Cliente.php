<?php

namespace App\Models;

class Cliente extends ModeloBase
{
    protected $table = 'clientes';

    protected $fillable = [
        'nombre',
        'tipo_documento',
        'numero_documento',
        'correo',
        'telefono',
        'direccion',
    ];

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'cliente_id');
    }

    public function repartos()
    {
        return $this->hasMany(Reparto::class, 'cliente_id');
    }
}
