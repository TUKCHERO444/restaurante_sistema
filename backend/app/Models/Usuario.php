<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Usuario del sistema (roles: administrador, cajero, mozo, cocina).
 *
 * Columnas traducidas al español; los métodos sobrescritos mantienen
 * compatible el sistema de autenticación de Laravel.
 */
class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'correo',
        'contrasena',
        'rol',
    ];

    protected $hidden = [
        'contrasena',
        'token_recuerdame',
    ];

    public function getAuthPassword(): string
    {
        return $this->contrasena;
    }

    public function getRememberTokenName(): string
    {
        return 'token_recuerdame';
    }

    public function getEmailForVerification(): string
    {
        return $this->correo;
    }

    protected function casts(): array
    {
        return [
            'correo_verificado_en' => 'datetime',
            'contrasena' => 'hashed',
        ];
    }

    // Relaciones
    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'usuario_id');
    }

    public function cajas()
    {
        return $this->hasMany(Caja::class, 'usuario_id');
    }

    public function gastos()
    {
        return $this->hasMany(Gasto::class, 'usuario_id');
    }

    public function movimientosInventario()
    {
        return $this->hasMany(MovimientoInventario::class, 'usuario_id');
    }

    public function repartos()
    {
        return $this->hasMany(Reparto::class, 'usuario_id');
    }

    /** Caja abierta del usuario (turno activo). */
    public function cajaAbierta()
    {
        return $this->hasOne(Caja::class, 'usuario_id')->where('estado', 'abierta')->latestOfMany();
    }
}
