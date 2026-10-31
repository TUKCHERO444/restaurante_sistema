<?php

namespace App\Models;

class Reparto extends ModeloBase
{
    protected $table = 'repartos';

    protected $fillable = [
        'pedido_id',
        'cliente_id',
        'nombre_cliente',
        'telefono_cliente',
        'direccion',
        'referencia',
        'repartidor_id',
        'usuario_id',
        'caja_id',
        'estado',
        'metodo_pago',
        'costo_envio',
        'notas',
        'programado_para',
        'entregado_en',
    ];

    protected function casts(): array
    {
        return [
            'costo_envio' => 'decimal:2',
            'programado_para' => 'datetime',
            'entregado_en' => 'datetime',
        ];
    }

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function repartidor()
    {
        return $this->belongsTo(Repartidor::class, 'repartidor_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function caja()
    {
        return $this->belongsTo(Caja::class, 'caja_id');
    }
}
