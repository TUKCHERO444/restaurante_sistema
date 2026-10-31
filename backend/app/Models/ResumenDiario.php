<?php

namespace App\Models;

class ResumenDiario extends ModeloBase
{
    protected $table = 'resumenes_diarios';

    protected $fillable = [
        'fecha_referencia',
        'fecha_generacion',
        'correlativo',
        'identificador',
        'total_documentos',
        'monto_total',
        'estado_sunat',
        'ticket',
        'codigo_sunat',
        'descripcion_sunat',
        'ruta_xml',
        'ruta_cdr',
        'hash',
        'enviado_en',
        'consultado_en',
        'usuario_id',
    ];

    protected function casts(): array
    {
        return [
            'fecha_referencia' => 'date',
            'fecha_generacion' => 'date',
            'correlativo' => 'integer',
            'total_documentos' => 'integer',
            'monto_total' => 'decimal:2',
            'enviado_en' => 'datetime',
            'consultado_en' => 'datetime',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
