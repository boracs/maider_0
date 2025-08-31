<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TiendaController extends Controller
{



    // Muestra la página de la tienda con los productos
        public function index_mas_que_surf()
       {
            $productos = Producto::where('eliminado', 0)
                ->with('imagenes') // traemos todas las imágenes
                ->orderBy('nombre', 'asc')
                ->orderBy('id', 'asc')
                ->get()
                ->map(function($producto) {
                    // Buscar la imagen principal correctamente
                    $imagen = $producto->imagenes->firstWhere('es_principal', 1);
                    $producto->imagenPrincipal = $imagen ? $imagen->ruta : 'img/placeholder.jpg';
                    return $producto;
                });

            // Preparar solo los campos que vamos a enviar al frontend
            $productosParaFrontend = $productos->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'precio' => $p->precio,
                    'unidades' => $p->unidades,
                    'descuento' => $p->descuento,
                    'imagenPrincipal' => $p->imagenPrincipal, // string seguro
                ];
            });
            return Inertia::render('Tienda', [
                'productos' => $productosParaFrontend,
            ]);
        }



        //MUESTRA LSO PRODCUTSO CON IMAGENES 
        public function index_oficial()
        {
            $productos = Producto::where('eliminado', 0)
                ->with('imagenes') // traemos todas las imágenes
                ->orderBy('nombre', 'asc')
                ->orderBy('id', 'asc')
                ->get()
                ->map(function($producto) {
                    // Buscar la imagen principal correctamente
                    $imagen = $producto->imagenes->firstWhere('es_principal', 1);
                    $producto->imagenPrincipal = $imagen ? $imagen->ruta : 'img/placeholder.jpg';
                    return $producto;
                });

            // Preparar solo los campos que vamos a enviar al frontend
            $productosParaFrontend = $productos->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'precio' => $p->precio,
                    'unidades' => $p->unidades,
                    'descuento' => $p->descuento,
                    'imagenPrincipal' => $p->imagenPrincipal, // string seguro
                ];
            });
            return Inertia::render('Tienda', [
                'productos' => $productosParaFrontend,
            ]);
        }

        // Agrega un producto al carrito
        public function agregarAlCarrito(Request $request)
        {
            $productoId = $request->input('producto_id');
    
            // Aquí puedes implementar tu lógica para agregar al carrito.
            // Por ejemplo, guardar en una tabla de carritos o en la sesión.
    
            return response()->json(['mensaje' => 'Producto añadido al carrito']);
        }


        
 }
