<?php

namespace App\Models;

class Gasto extends ModeloBase
{
    protected $table = 'gastos';

    protected $fillable = [
        'concepto',
        'monto',
        'usuario_id',
        'caja_id',
    ];

    protected function casts(): array
    {
        return ['monto' => 'decimal:2'];
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
