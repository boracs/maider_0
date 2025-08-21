<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Producto;
use App\Models\Pedido;
use App\Models\Carrito;
use App\Models\Imagen;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1️⃣ Crear usuarios
        $users = User::factory(10)->create();

        // 2️⃣ Crear productos
        $productos = Producto::factory(40)->create();

        // 3️⃣ Crear imágenes para cada producto
        foreach ($productos as $producto) {
            // Generamos entre 1 y 3 imágenes por producto y las guardamos
            $imagenes = Imagen::factory(rand(1, 3))->create([
                'producto_id' => $producto->id
            ]);

            // Elegimos una imagen aleatoria como principal
            $producto->imagenes()->inRandomOrder()->first()->update(['es_principal' => true]);
        }

        // 4️⃣ Crear pedidos y asociar productos
        foreach ($users as $user) {
            $pedido = Pedido::factory()->create([
                'id_usuario' => $user->id,
            ]);

            // Asociar entre 1 y 3 productos aleatorios al pedido
            $selectedProducts = $productos->random(rand(1, 3));
            foreach ($selectedProducts as $producto) {
                $pedido->productos()->attach($producto->id, [
                    'cantidad' => rand(1, 3),
                    'descuento_aplicado' => rand(0, $producto->descuento ?? 0),
                    'precio_pagado' => $producto->precio,
                ]);
            }
        }

        // 5️⃣ Crear carritos para cada usuario
        foreach ($users as $user) {
            $carrito = Carrito::create([
                'id_usuario' => $user->id,
            ]);

            // Asociar entre 1 y 5 productos aleatorios al carrito
            $selectedProducts = $productos->random(rand(1, 5));
            foreach ($selectedProducts as $producto) {
                $carrito->productos()->attach($producto->id, [
                    'cantidad' => rand(1, 5),
                ]);
            }
        }
    }
}