<?php

namespace App\Http\Controllers;

use App\Models\Carrito;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Producto;
use Illuminate\Support\Facades\Redirect; //es apra redireccionar con mensajes
use Illuminate\Support\Facades\DB;

class CarritoController extends Controller
{
    /**
     * Muestra el carrito del usuario.
     *
     * @return \Inertia\Response
     */



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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




    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




public function agregarAlCarrito($productoId)
{
    $user = auth()->user();

    try {
        DB::beginTransaction(); // 🛡️ INICIO

        $producto = Producto::find($productoId);

        // 1. VERIFICACIÓN DEL PRODUCTO
        if (!$producto) {
            DB::rollBack();
            return back()->with('error', 'El producto solicitado ya no está disponible.');
        }

        // 2. VERIFICACIÓN DE STOCK INICIAL
        if ($producto->unidades <= 0) {
            DB::rollBack();
            return back()->with('error', '¡Agotado! No queda stock disponible de ' . $producto->nombre . '.');
        }

        // 3. OBTENER O CREAR CARRITO (Atomicidad: si falla, se revierte)
        // Usamos firstOrCreate para que la operación esté dentro del control transaccional
        $carrito = Carrito::firstOrCreate(['id_usuario' => $user->id]);

        $productoEnCarrito = $carrito->productos()->where('producto_id', $productoId)->first();
        $cantidadAAgregar = 1;

        if ($productoEnCarrito) {
            $nuevaCantidad = $productoEnCarrito->pivot->cantidad + $cantidadAAgregar;

            // 4. VERIFICACIÓN AVANZADA: Cantidad vs. Stock
            if ($nuevaCantidad > $producto->unidades) {
                DB::rollBack();
                return back()->with('error', 'Ya tienes la cantidad máxima (' . $producto->unidades . ') de ' . $producto->nombre . ' del tock que nos queda.');
            }
            
            $carrito->productos()->updateExistingPivot($productoId, [
                'cantidad' => DB::raw('cantidad + 1'), 
            ]);
        } else {
            $carrito->productos()->attach($productoId, ['cantidad' => $cantidadAAgregar]);
        }

        DB::commit(); // ✅ COMMIT: Cambios guardados

        // --- Lógica de Recálculo y Formateo (solo lectura) ---
        // ... (Tu código de recálculo aquí)

        // 5. RESPUESTA DE ÉXITO DE INERTIA
        return back()->with('success', 'Producto agregado al carrito exitosamente.');

    } catch (\Exception $e) {
        // ❌ FALLO: Rollback y respuesta de error a Inertia
        DB::rollBack();
        
        \Log::error('Error al agregar al carrito: ' . $e->getMessage()); 
        
        // ¡IMPORTANTE! Siempre devolvemos back()->with()
        return back()->with('error', 'Ocurrió un error inesperado en el servidor. Por favor, intenta de nuevo.');
    }
}



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



 public function eliminarProducto($productoId)
    {
        $user = auth()->user();
        $carrito = Carrito::where('id_usuario', $user->id)->first();

        if (!$carrito) {
            // Si el carrito no existe, redirigimos con un error, ya que es una petición Inertia
            return Redirect::back()->with('error', 'Carrito no encontrado.');
        }

        $producto = $carrito->productos()->find($productoId);

        if ($producto) {
            $nombreProducto = $producto->nombre;
            $carrito->productos()->detach($productoId);

            // ¡SOLUCIÓN! Redirigimos a la misma página del carrito (carrito.index).
            // Inertia interceptará esto y recargará los props 'productos' y 'total'.
            return Redirect::route('carrito')->with('success', "El producto \"$nombreProducto\" ha sido eliminado del carrito.");
        }

        return Redirect::back()->with('error', 'Producto no encontrado en el carrito.');
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






/////realziar pedido/////////////



 public function crear(Request $request): \Illuminate\Http\RedirectResponse
    {
        // 1. VALIDACIÓN
        // Usamos validate() para que Laravel gestione la respuesta de error 422 (onError en Inertia)
        $request->validate([
            'productos' => 'required|array',
            'productos.*.id' => 'required|integer|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
            'total' => 'required|numeric|min:0.01',
        ]);
        
        $productosEnPedido = $request->input('productos');
        $totalFinal = $request->input('total');
        $user = $request->user(); // Mejor práctica: usar el helper de Request

        try {
            // 🛡️ INICIO DE LA TRANSACCIÓN (Garantía de atomicidad)
            DB::beginTransaction();

            // 2. VERIFICACIÓN CRÍTICA DE STOCK Y PREPARACIÓN DE DATOS
            $productosParaAdjuntar = [];
            
            foreach ($productosEnPedido as $item) {
                // Bloqueamos el producto. ¡CRÍTICO! Esto evita que dos usuarios compren la última unidad a la vez.
                $producto = Producto::lockForUpdate()->find($item['id']);

                if (!$producto || $producto->unidades < $item['cantidad']) {
                    DB::rollBack();
                    
                    // ❌ RESPUESTA DE ERROR: Usamos back() para que Inertia muestre el Toast.
                    $nombreProducto = $producto ? $producto->nombre : 'desconocido';
                    return back()->with('error', "No hay stock suficiente para el producto '{$nombreProducto}'. Stock disponible: {$producto->unidades}.");
                }

                // Descontar stock (Operación de escritura crítica)
                $producto->unidades -= $item['cantidad'];
                $producto->save();
                
                // Preparar datos para la tabla pivote
                $productosParaAdjuntar[$item['id']] = [
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $item['precio'], 
                    'descuento' => $item['descuento'] ?? 0, // Si lo pasas, es buena práctica registrarlo
                ];
            }

            // 3. CREACIÓN DEL PEDIDO
            $pedido = Pedido::create([
                'id_usuario' => $user->id,
                'total' => $totalFinal,
                'estado' => 'completado', 
            ]);

            // 4. ADJUNTAR PRODUCTOS
            $pedido->productos()->attach($productosParaAdjuntar);

            // 5. VACIAR EL CARRITO (Limpieza)
            // Asumimos que la relación 'carrito' está definida en el modelo User, o usamos el modelo Carrito
            Carrito::where('id_usuario', $user->id)->delete(); 

            DB::commit(); // ✅ COMMIT: Confirmar todos los cambios

            // 6. RESPUESTA DE ÉXITO FINAL
            // Redirección explícita a la página de confirmación, como solicitaste.
             return Inertia::location(route('pedido.confirmacion')); 
          

        } catch (\Exception $e) {
            // ❌ ROLLBACK: Deshacer todos los cambios ante cualquier error imprevisto (DB, etc.)
            DB::rollBack();
            
            \Log::error('Error FATAL al crear el pedido: ' . $e->getMessage()); 
            
            // 7. RESPUESTA DE ERROR GENÉRICA (Vuelve al carrito)
            return back()->with('error', 'Ocurrió un error inesperado al procesar el pedido. Intenta de nuevo. (Ref: ' . $e->getMessage() . ')');
        }
    }



}

























