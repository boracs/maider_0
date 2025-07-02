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
            // Filtrar productos que no están eliminados
            $productos = Producto::where('eliminado', 0)->get(); // Solo productos no eliminados
    
            return Inertia::render('Tienda', [
                'productos' => $productos,
            ]);
        }
        public function index_oficial()
        {
            // Filtrar productos que no están eliminados
            $productos = Producto::where('eliminado', 0)->get(); // Solo productos no eliminados
    
            return Inertia::render('Tienda', [
                'productos' => $productos,
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
