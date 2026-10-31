<?php

namespace App\Models;

class Area extends ModeloBase
{
    protected $table = 'areas';

    protected $fillable = ['nombre'];

    public function mesas()
    {
        return $this->hasMany(Mesa::class, 'area_id');
    }
}
