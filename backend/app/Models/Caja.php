<?php

namespace App\Models;

class Caja extends ModeloBase
{
    protected $table = 'cajas';

    protected $fillable = [
        'usuario_id',
        'apertura_en',
        'cierre_en',
        'monto_apertura',
        'monto_cierre',
        'monto_esperado',
        'diferencia',
        'estado',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'apertura_en' => 'datetime',
            'cierre_en' => 'datetime',
            'monto_apertura' => 'decimal:2',
            'monto_cierre' => 'decimal:2',
            'monto_esperado' => 'decimal:2',
            'diferencia' => 'decimal:2',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'caja_id');
    }

    public function gastos()
    {
        return $this->hasMany(Gasto::class, 'caja_id');
    }

    public function repartos()
    {
        return $this->hasMany(Reparto::class, 'caja_id');
    }
}
