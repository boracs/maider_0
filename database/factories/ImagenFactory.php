<?php

namespace Database\Factories;

use App\Models\Imagen;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImagenFactory extends Factory
{
    protected $model = Imagen::class;

    public function definition()
    {
        return [
            'nombre' => $this->faker->word, // nombre aleatorio para la imagen
            'ruta' => $this->faker->imageUrl(640, 480, 'technics', true), // URL de imagen falsa
            'es_principal' => false, // por defecto no es principal, se asignará en el seeder
            'producto_id' => null, // Se asignará en el seeder con saveMany
        ];
    }
}