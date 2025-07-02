<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Producto;
use App\Models\Pedido;
use App\Models\Carrito;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuarios
        User::factory(10)->create();

        // Crear productos
        Producto::factory(10)->create();

        // Obtener todos los usuarios
        $users = User::all();

        // Crear pedidos, asignando usuarios existentes
        foreach ($users as $user) {
            Pedido::factory()->create([
                'id_usuario' => $user->id, // Usando un id de usuario válido
            ]);
        }

        // Obtener todos los pedidos y productos
        $pedidos = Pedido::all();
        $productos = Producto::all();

        // Asociar productos con pedidos
        foreach ($pedidos as $pedido) {
            $selectedProducts = $productos->random(rand(1, 3)); // Selecciona entre 1 y 3 productos aleatorios
            foreach ($selectedProducts as $producto) {
                $pedido->productos()->attach($producto->id, ['cantidad' => rand(1, 3)]); // Asocia el producto con una cantidad aleatoria
            }
        }

        // Crear carritos para cada usuario
        foreach ($users as $user) {
            $carrito = Carrito::create([
                'id_usuario' => $user->id, // Cada usuario tiene un único carrito
            ]);

            // Asociar productos aleatorios con este carrito
            $selectedProducts = $productos->random(rand(1, 5)); // Selecciona entre 1 y 5 productos aleatorios
            foreach ($selectedProducts as $producto) {
                $carrito->productos()->attach($producto->id, ['cantidad' => rand(1, 5)]); // Asocia el producto con una cantidad aleatoria
            }
        }
    }
}