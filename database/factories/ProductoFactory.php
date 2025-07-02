<?php

namespace Database\Factories;

use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductoFactory extends Factory
{
    protected $model = Producto::class;

    public function definition()
    {
        return [
            'nombre' => $this->faker->word, // Genera un nombre aleatorio
            'precio' => $this->faker->randomFloat(2, 5, 100), // Precio aleatorio entre 5 y 100
            'unidades' => $this->faker->numberBetween(1, 50), // Cantidad aleatoria entre 1 y 100
            'imagen' => $this->faker->imageUrl(640, 480, 'technics', true), // URL falsa de imagen
            'descuento' => $this->faker->numberBetween(0, 80), 
            'eliminado' => $this->faker->boolean(30), //probabilidad del 30% de que sea veradero osea que este eliminasdo
        ];
    }
}