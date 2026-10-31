<?php

namespace App\Models;

class Configuracion extends ModeloBase
{
    protected $table = 'configuraciones';

    protected $fillable = [
        'clave',
        'valor',
    ];
}
