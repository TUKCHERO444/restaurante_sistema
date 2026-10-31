<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Consultas guardadas del asistente IA (módulo futuro).
 * Sin marcas de tiempo estándar: usa `creado_en` / `ultimo_uso`.
 */
class IaConsulta extends Model
{
    use HasFactory;    protected $table = 'ia_consultas';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'pregunta',
        'titulo',
        'sql_texto',
        'grafico',
        'favorito',
        'veces',
        'creado_en',
        'ultimo_uso',
    ];

    protected function casts(): array
    {
        return [
            'favorito' => 'boolean',
            'veces' => 'integer',
            'creado_en' => 'datetime',
            'ultimo_uso' => 'datetime',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
