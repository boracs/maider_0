<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<string>
     */
    protected $fillable = [
        'role',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'numeroTaquilla',
        'password',
    ];
    // Valor por defecto para el campo 'role'
    protected $attributes = [
        'role' => 'user',
    ];
    /**
     * Los atributos que deben ser ocultados para la serialización.
     *
     * @var array<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Los atributos que deben ser casteados.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relación con la tabla de pedidos (un usuario puede tener muchos pedidos).
     */
    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'id_usuario');
    }

    /**
     * Relación con la tabla de carrito (un usuario puede tener muchos productos en su carrito).
     */
    public function carrito()
    {
        return $this->hasOne(Carrito::class, 'id_usuario');
    }


////////////////////////////////
// Relación con Productos
public function productos()
{
    return $this->belongsToMany(Producto::class)->withPivot('cantidad', 'descuento_aplicado', 'precio_pagado');
}
//////////////////////////////////


}
