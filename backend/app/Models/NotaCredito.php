<?php

namespace App\Models;

class NotaCredito extends ModeloBase
{
    protected $table = 'notas_credito';

    protected $fillable = [
        'pedido_id',
        'serie',
        'correlativo',
        'tipo_documento',
        'codigo_motivo',
        'descripcion_motivo',
        'subtotal',
        'igv',
        'total',
        'estado_sunat',
        'codigo_sunat',
        'descripcion_sunat',
        'ruta_xml',
        'ruta_cdr',
        'ruta_pdf',
        'hash',
        'enviado_en',
        'usuario_id',
    ];

    protected function casts(): array
    {
        return [
            'correlativo' => 'integer',
            'subtotal' => 'decimal:2',
            'igv' => 'decimal:2',
            'total' => 'decimal:2',
            'enviado_en' => 'datetime',
        ];
    }

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
