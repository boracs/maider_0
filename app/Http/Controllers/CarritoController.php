<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Carrito;
use App\Models\Producto;

class CarritoController extends Controller
{
    /**
     * Muestra el carrito del usuario.
     *
     * @return \Inertia\Response
     */





     public function index()
{
    $user = auth()->user();

    // Obtener los productos del carrito con la cantidad y el descuento desde la tabla pivote
    $carrito = Carrito::where('id_usuario', $user->id)
        ->with(['productos' => function ($query) {
            $query->select('productos.id', 'productos.nombre', 'productos.precio', 'productos.descuento')
                ->withPivot('cantidad'); // Esto accede a la cantidad desde la tabla pivote
        }])
        ->get();

    // Verificar si el carrito está vacío
    if ($carrito->isEmpty()) {
        return Inertia::render('Carrito', [
            'productos' => [],
            'total' => 0,
            'message' => 'Tu carrito está vacío.',
        ]);
    }

    // Procesar los productos en el carrito y calcular el subtotal con descuento
    $productos = $carrito->flatMap(function ($item) {
        return $item->productos->map(function ($producto) use ($item) {
            $cantidad = $producto->pivot->cantidad;
            $descuento = $producto->descuento; // Descuento del producto
            $precioConDescuento = $producto->precio - ($producto->precio * ($descuento / 100)); // Aplicamos el descuento
            $subtotal = $precioConDescuento * $cantidad;

            return [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'precio' => $precioConDescuento, // Mostramos el precio con descuento
                'cantidad' => $cantidad,
                'subtotal' => number_format($subtotal, 2),
                'descuento' => $descuento, // Enviamos el descuento para mostrarlo en el frontend
            ];
        });
    });

    // Calcular el total sumando todos los subtotales
    $total = $productos->reduce(function ($acc, $producto) {
        return $acc + $producto['subtotal'];
    }, 0);

    return Inertia::render('Carrito', [
        'productos' => $productos,
        'total' => number_format($total, 2),
    ]);
}


public function agregarAlCarrito($productoId)
{
    $user = auth()->user(); // Obtener el usuario logueado

    // Verificar si el producto ya está en el carrito del usuario
    $carrito = Carrito::where('id_usuario', $user->id)->first();

    // Si no hay carrito, creamos uno nuevo
    if (!$carrito) {
        $carrito = Carrito::create(['id_usuario' => $user->id]);
    }

    // Verificar si el producto ya está en el carrito
    $productoEnCarrito = $carrito->productos()->where('producto_id', $productoId)->first();

    if ($productoEnCarrito) {
        // Incrementar cantidad si ya existe
        $carrito->productos()->updateExistingPivot($productoId, [
            'cantidad' => \DB::raw('cantidad + 1'),
        ]);
    } else {
        // Agregar producto al carrito si no existe
        $carrito->productos()->attach($productoId, ['cantidad' => 1]);
    }

    // Obtener los productos del carrito actualizado
    $productos = $carrito->productos()->get();

    // Procesar los productos del carrito y calcular el subtotal con descuento
    $productosConDatos = $productos->map(function ($producto) {
        $cantidad = $producto->pivot->cantidad;
        $descuento = $producto->descuento;
        $precioConDescuento = $producto->precio - ($producto->precio * ($descuento / 100));
        $subtotal = $precioConDescuento * $cantidad;

        return [
            'id' => $producto->id,
            'nombre' => $producto->nombre,
            'precio' => $precioConDescuento, // Mantén este valor como numérico
            'cantidad' => $cantidad,
            'subtotal' => $subtotal, // No uses number_format aquí
            'descuento' => $descuento,
        ];
    });

    // Calcular el total sumando los subtotales
    $total = $productosConDatos->reduce(function ($acc, $producto) {
        return $acc + $producto['subtotal']; // Asegúrate de que sea numérico
    }, 0);

    // Formatear los valores antes de enviarlos a la vista
    $productosConDatosFormateados = $productosConDatos->map(function ($producto) {
        $producto['precio'] = number_format($producto['precio'], 2);
        $producto['subtotal'] = number_format($producto['subtotal'], 2);
        return $producto;
    });

    return Inertia::render('Carrito', [
        'productos' => $productosConDatosFormateados,
        'total' => number_format($total, 2), // Formateo final del total
    ]);
}




public function eliminarProducto($productoId)
{
    $user = auth()->user(); // Obtener el usuario logueado
    $carrito = Carrito::where('id_usuario', $user->id)->first();
    
    if (!$carrito) {
        return redirect()->route('carrito.index')->with('error', 'Carrito no encontrado.');
    }

    // Buscar el producto en el carrito
    $producto = $carrito->productos()->find($productoId);
    
    if ($producto) {
        // Guardar el nombre del producto antes de eliminarlo
        $nombreProducto = $producto->nombre;

        // Eliminar el producto del carrito
        $carrito->productos()->detach($productoId);

        // Redirigir a la ruta 'producto.eliminado.carrito' pasando solo el nombre del producto
        return redirect()->route('producto.eliminado.carrito', ['nombreProducto' => $nombreProducto]);
    }

    // Si el producto no existe en el carrito
    return redirect()->route('carrito.index')->with('error', 'El producto no se encontró en el carrito.');
}










}
