<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<string>
     */
    protected $fillable = [
        'nombre',
        'precio',
        'unidades',
        'descuento',
        'eliminado',
    ];

    /**
     * Relación con la tabla pedido_producto (un producto puede estar en muchos pedidos).
     */
    public function pedidoProductos()
    {
        return $this->hasMany(PedidoProducto::class, 'id_producto');
    }

    /**
     * Relación con la tabla carrito_producto (un producto puede estar en muchos carritos).
     */
    public function carritos()
    {
        return $this->belongsToMany(Carrito::class, 'carrito_producto', 'producto_id', 'carrito_id')
                    ->withPivot('cantidad')
                    ->withTimestamps();
    }

    /**
     * Relación directa con los pedidos a través de pedido_producto.
     */
    public function pedidos()
    {
        return $this->belongsToMany(Pedido::class, 'pedido_producto', 'id_producto', 'id_pedido')
                    ->withPivot('cantidad', 'precio_pagado', 'descuento_aplicado')
                    ->withTimestamps();
    }

    /**
     * Relación con imágenes (un producto puede tener muchas imágenes).
     */
    public function imagenes()
    {
        return $this->hasMany(Imagen::class, 'producto_id');
    }
    

    // Para obtener directamente la principal
    public function imagenPrincipal()
    {
        return $this->hasOne(Imagen::class)->where('es_principal', true);
    }
}