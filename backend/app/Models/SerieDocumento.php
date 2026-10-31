<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class SerieDocumento extends ModeloBase
{
    protected $table = 'series_documentos';

    protected $fillable = [
        'codigo_documento',
        'tipo_documento',
        'serie',
        'ultimo_numero',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'ultimo_numero' => 'integer',
            'activo' => 'boolean',
        ];
    }

    /**
     * Reserva el siguiente número de la serie de forma atómica.
     * Equivalente al `DocumentSeries::next()` del sistema anterior.
     */
    public static function siguiente(string $serie): int
    {
        return DB::transaction(function () use ($serie) {
            $talonario = self::where('serie', $serie)->lockForUpdate()->firstOrFail();
            $talonario->ultimo_numero++;
            $talonario->save();

            return $talonario->ultimo_numero;
        });
    }
}
