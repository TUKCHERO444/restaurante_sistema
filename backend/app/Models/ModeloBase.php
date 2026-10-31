<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo base del dominio en español.
 *
 * Centraliza la convención de marcas de tiempo traducidas
 * (`creado_en` / `actualizado_en`) para todas las tablas de negocio.
 */
abstract class ModeloBase extends Model
{
    use HasFactory;

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';
}
