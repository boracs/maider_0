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
        'imagen',
        'descuento',  
        'eliminado',
    ];

    /**
     * Relación con la tabla de pedido_producto (un producto puede estar en muchos pedidos).
     */
    public function pedidoProductos()
    {
        return $this->hasMany(PedidoProducto::class, 'id_producto');
    }

    /**
     * Relación con la tabla de carrito (un producto puede estar en muchos c).
     */
    public function carritos()
    {
        return $this->belongsToMany(Carrito::class, 'carrito_producto')->withPivot('cantidad')->withTimestamps();
    }


    public function pedidos()
    {
        return $this->belongsToMany(Pedido::class, 'producto_pedido')
                    ->withPivot('descuento_aplicado', 'precio_pagado') // Campos adicionales de la tabla pivote
                    ->withTimestamps(); // Registra las marcas de tiempo en la tabla pivote
    }




}