<?php

namespace App\Models;

class Pedido extends ModeloBase
{
    protected $table = 'pedidos';

    protected $fillable = [
        'mesa_id',
        'usuario_id',
        'cliente_id',
        'caja_id',
        'estado',
        'total',
        'subtotal',
        'igv',
        'total_gravado',
        'total_exonerado',
        'total_inafecto',
        'total_gratuito',
        'descuento',
        'propina',
        'metodo_pago',
        'monto_recibido',
        'vuelto',
        'tipo_comprobante',
        'nombre_cliente',
        'documento_cliente',
        'serie',
        'correlativo',
        'estado_sunat',
        'codigo_sunat',
        'descripcion_sunat',
        'ruta_xml',
        'ruta_cdr',
        'ruta_pdf',
        'hash',
        'enviado_en',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'igv' => 'decimal:2',
            'total_gravado' => 'decimal:2',
            'total_exonerado' => 'decimal:2',
            'total_inafecto' => 'decimal:2',
            'total_gratuito' => 'decimal:2',
            'descuento' => 'decimal:2',
            'propina' => 'decimal:2',
            'monto_recibido' => 'decimal:2',
            'vuelto' => 'decimal:2',
            'correlativo' => 'integer',
            'enviado_en' => 'datetime',
        ];
    }

    public function mesa()
    {
        return $this->belongsTo(Mesa::class, 'mesa_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function caja()
    {
        return $this->belongsTo(Caja::class, 'caja_id');
    }

    public function detalles()
    {
        return $this->hasMany(PedidoDetalle::class, 'pedido_id');
    }

    public function notasCredito()
    {
        return $this->hasMany(NotaCredito::class, 'pedido_id');
    }

    public function reparto()
    {
        return $this->hasOne(Reparto::class, 'pedido_id');
    }

    /** Número completo del comprobante (serie-correlativo). */
    public function getNumeroCompletoAttribute(): ?string
    {
        if (! $this->serie || ! $this->correlativo) {
            return null;
        }

        return "{$this->serie}-{$this->correlativo}";
    }

    /** Indica si el comprobante es electrónico (boleta/factura). */
    public function getEsElectronicoAttribute(): bool
    {
        return in_array($this->tipo_comprobante, ['boleta', 'factura'], true);
    }
}
