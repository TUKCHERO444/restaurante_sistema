<?php

namespace App\Models;

class Producto extends ModeloBase
{
    protected $table = 'productos';

    protected $fillable = [
        'categoria_id',
        'nombre',
        'codigo',
        'codigo_barras',
        'precio',
        'precio_promocional',
        'costo',
        'stock',
        'vendible',
        'imagen',
        'activo',
        'recomendado_chef',
        'nuevo',
    ];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'precio_promocional' => 'decimal:2',
            'costo' => 'decimal:2',
            'stock' => 'integer',
            'vendible' => 'boolean',
            'activo' => 'boolean',
            'recomendado_chef' => 'boolean',
            'nuevo' => 'boolean',
        ];
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function detalles()
    {
        return $this->hasMany(PedidoDetalle::class, 'producto_id');
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoInventario::class, 'producto_id');
    }

    /** Insumos de la receta de este plato (producto → insumos). */
    public function ingredientes()
    {
        return $this->belongsToMany(
            Producto::class,
            'producto_ingredientes',
            'producto_id',
            'ingrediente_id'
        )->withPivot('cantidad');
    }

    /** Platos que usan este producto como insumo. */
    public function usadoEn()
    {
        return $this->belongsToMany(
            Producto::class,
            'producto_ingredientes',
            'ingrediente_id',
            'producto_id'
        )->withPivot('cantidad');
    }

    /** Costo de la receta: suma(costo insumo × cantidad). */
    public function getCostoRecetaAttribute(): float
    {
        return (float) $this->ingredientes->sum(
            fn (Producto $insumo) => (float) $insumo->costo * (float) $insumo->pivot->cantidad
        );
    }
}
