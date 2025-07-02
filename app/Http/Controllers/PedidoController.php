<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\Producto;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
class PedidoController extends Controller
{



    public function crear(Request $request)
    {
        $productosCarrito = $request->input('productos'); // Asumiendo que los productos vienen en el request
        $user = auth()->user(); // Obtener al usuario autenticado
        $totalCarrito = 0;
        
        // Si tienes un campo de fecha (como 'fecha_entrega'), asegurémonos de que esté en el formato adecuado
        $fechaEntrega = $request->input('fecha_entrega') 
            ? Carbon::createFromFormat('d/m/Y', $request->input('fecha_entrega'))->format('Y-m-d') 
            : null; // O null si no se proporciona la fecha
    
        // Crear el pedido primero
        $pedido = Pedido::create([
            'id_usuario' => $user->id,
            'precio_total' => 0, // Establece el precio total inicialmente como 0
            'pagado' => false,
            'entregado' => false,
            'fecha_entrega' => $fechaEntrega, // Asegúrate de incluir la fecha aquí si corresponde
        ]);
        
        // Iterar sobre los productos del carrito y calcular el precio total
        foreach ($productosCarrito as $producto) {
            $prod = Producto::find($producto['id']);
            if ($prod) {
                // Calcular el precio con descuento
                $precioConDescuento = $prod->precio - ($prod->precio * ($prod->descuento / 100));
                $subtotal = $precioConDescuento * $producto['cantidad'];
                $totalCarrito += $subtotal;
        
                // Insertar productos en la tabla pedido_producto, incluyendo descuento y precio pagado
                $pedido->productos()->attach($prod->id, [
                    'cantidad' => $producto['cantidad'],
                    'descuento_aplicado' => $prod->descuento,  // Descuento aplicado
                    'precio_pagado' => $precioConDescuento,     // Precio con descuento
                ]);
            }
        }
    
        // Eliminar los productos del carrito (si tienes una tabla de carrito asociada)
        $user->carrito()->delete(); // Esto eliminaría todos los productos del carrito del usuario
    
        // Actualizar el precio total del pedido
        $pedido->update([
            'precio_total' => $totalCarrito,
        ]);
        
        // Redirigir al usuario a la página de detalles del pedido
        return redirect()->route('mostrar.pedido', ['id_pedido' => $pedido->id]);
    }



    public function mostrarPedido($id_pedido)
        {
            // Obtener el pedido por su ID, lanzando una excepción si no se encuentra
            $pedido = Pedido::findOrFail($id_pedido);

            // Obtener los productos del pedido
            $productos = $pedido->productos; // Relación 'productos' ya definida en el modelo Pedido

            // Cálculo del total con los descuentos aplicados
            $totalConDescuento = 0;
            foreach ($productos as $producto) {
                // Calcular el precio con descuento
                $precioConDescuento = $producto->precio - ($producto->precio * ($producto->descuento / 100));
                // Acumulamos el subtotal considerando la cantidad del producto
                $totalConDescuento += $precioConDescuento * $producto->pivot->cantidad;
            }

          
            // Retornar la vista con los datos del pedido y los productos
            return Inertia::render('Pedido', [
                'pedido' => $pedido,
                'productos' => $productos,
                'totalConDescuento' => $totalConDescuento,
            ]);
        }



        //muestar todos los pedidso teniendo enceunta la tabla piuvote es un poco enrevesado
        public function mostrarPedidos()
        {
            $user_id = auth()->id();
            
            // Obtener los pedidos con sus productos y los datos de la tabla pivote
            $pedidos = Pedido::where('id_usuario', $user_id)
                ->with(['productos' => function ($query) {
                    $query->select('productos.id', 'nombre', 'precio') // Campos de productos
                        ->withPivot('cantidad', 'descuento_aplicado', 'precio_pagado'); // Campos de la pivote
                }])
                ->get();
            
            // Transformar los datos para incluir los timestamps
            return Inertia::render('Pedidos', [
                'pedidos' => $pedidos->map(function ($pedido) {
                    return [
                        'id' => $pedido->id,
                        'precio_total' => $pedido->precio_total,
                        'pagado' => $pedido->pagado,
                        'entregado' => $pedido->entregado,
                        'created_at' => $pedido->created_at->toIso8601String(),  // Aseguramos que el formato sea correcto
                        'productos' => $pedido->productos->map(function ($producto) {
                            return [
                                'id' => $producto->id,
                                'nombre' => $producto->nombre,
                                'precio' => $producto->precio,
                                'cantidad' => $producto->pivot->cantidad,
                                'descuento_aplicado' => $producto->pivot->descuento_aplicado,
                                'precio_pagado' => $producto->pivot->precio_pagado,
                            ];
                        }),
                    ];
                }),
            ]);
        }

//---------------------------------------------------------------------------------------------///////////////////////////////////////////////

// Componente para gestionar los filtros
public function index(Request $request)
{
    // Recoger los filtros de la solicitud
    $pagado = $request->input('pagado', ''); // Valor por defecto si no se pasa el filtro
    $entregado = $request->input('entregado', ''); // Valor por defecto si no se pasa el filtro
    
    // Obtener la página actual desde la solicitud
    $page = $request->get('page', 1); // Si no se pasa, por defecto será la página 1
    
    // Iniciar la consulta base para los pedidos
    $query = Pedido::with(['productos' => function ($query) {
        $query->select('productos.id', 'nombre', 'precio')
              ->withPivot('cantidad', 'descuento_aplicado', 'precio_pagado');
    }, 'usuario']); // Relación usuario, si la necesitas
    
    // Aplicar los filtros solo si los valores no están vacíos
    if (!is_null($pagado) && $pagado !== '') {
        $query->when($pagado !== '', function ($query) use ($pagado) {
            if ($pagado === '1') {
                $query->where('pagado', true); // Filtrar por 'sí'
            } elseif ($pagado === '0') {
                $query->where('pagado', false); // Filtrar por 'no'
            }
        });
    }

    if (!is_null($entregado) && $entregado !== '') {
        $query->when($entregado !== '', function ($query) use ($entregado) {
            if ($entregado === '1') {
                $query->where('entregado', true); // Filtrar por 'sí'
            } elseif ($entregado === '0') {
                $query->where('entregado', false); // Filtrar por 'no'
            }
        });
    }
    
    // Obtener los pedidos con la paginación (5 pedidos por página)
    $pedidos = $query->paginate(5);
    
    // Verifica si realmente hay pedidos
    if ($pedidos->isEmpty()) {
        Log::info("No se encontraron pedidos.");
    }
    
    // Contar el número total de pedidos
    $totalPedidos = $pedidos->total();
    
    // Devolver los pedidos con los filtros aplicados y la paginación
    return Inertia::render('GestorPedidos', [
        'pedidos' => [
            'data' => $pedidos->map(function ($pedido) {
                return [
                    'id' => $pedido->id,
                    'precio_total' => $pedido->precio_total,
                    'pagado' => $pedido->pagado,
                    'entregado' => $pedido->entregado,
                    'created_at' => $pedido->created_at->toIso8601String(),
                    'usuario' => [
                        'nombre' => $pedido->usuario->nombre,
                        'apellido' => $pedido->usuario->apellido,
                        'telefono' => $pedido->usuario->telefono,
                    ],
                    'productos' => $pedido->productos->map(function ($producto) {
                        return [
                            'id' => $producto->id,
                            'nombre' => $producto->nombre,
                            'precio' => $producto->precio,
                            'cantidad' => $producto->pivot->cantidad,
                            'descuento_aplicado' => $producto->pivot->descuento_aplicado,
                            'precio_pagado' => $producto->pivot->precio_pagado,
                        ];
                    }),
                ];
            })
        ],
        'totalPedidos' => $totalPedidos, // El total de pedidos para paginación
        'currentPage' => $pedidos->currentPage(),
        'lastPage' => $pedidos->lastPage(),
        'filters' => [
            'pagado' => $pagado,
            'entregado' => $entregado,
        ],
    ]);
}






    public function applyFilter(Request $request)
    {
        // Recoger los filtros enviados desde el frontend
        $pagado = $request->input('pagado'); // Puede ser '1', '0', o ''
        $entregado = $request->input('entregado'); // Puede ser '1', '0', o ''
        $usuarioNombre = $request->input('usuarioNombre'); // Filtro adicional de nombre de usuario (si se aplica)
    
        // Filtrar los pedidos según los valores
        $pedidos = Pedido::with(['usuario']) // Cargar la relación 'usuario'
            ->when($pagado !== '', function ($query) use ($pagado) {
                if ($pagado === '1') {
                    $query->where('pagado', true); // Filtrar por 'sí'
                } elseif ($pagado === '0') {
                    $query->where('pagado', false); // Filtrar por 'no'
                }
            })
            ->when($entregado !== '', function ($query) use ($entregado) {
                if ($entregado === '1') {
                    $query->where('entregado', true); // Filtrar por 'sí'
                } elseif ($entregado === '0') {
                    $query->where('entregado', false); // Filtrar por 'no'
                }
            })
            // Filtro adicional para el nombre del usuario si es necesario
            ->when(!empty($usuarioNombre), function ($query) use ($usuarioNombre) {
                $query->whereHas('usuario', function ($q) use ($usuarioNombre) {
                    $q->where('nombre', 'like', "%{$usuarioNombre}%"); // Filtro para el nombre del usuario
                });
            })
            ->paginate(12); // Paginación de los resultados (máximo 12 pedidos por página)
    
        // Contar el total de pedidos después de aplicar los filtros
        $totalPedidos = Pedido::with(['usuario'])
            ->when($pagado !== '', function ($query) use ($pagado) {
                if ($pagado === '1') {
                    $query->where('pagado', true); // Filtrar por 'sí'
                } elseif ($pagado === '0') {
                    $query->where('pagado', false); // Filtrar por 'no'
                }
            })
            ->when($entregado !== '', function ($query) use ($entregado) {
                if ($entregado === '1') {
                    $query->where('entregado', true); // Filtrar por 'sí'
                } elseif ($entregado === '0') {
                    $query->where('entregado', false); // Filtrar por 'no'
                }
            })
            // Filtro adicional para el nombre del usuario si es necesario
            ->when(!empty($usuarioNombre), function ($query) use ($usuarioNombre) {
                $query->whereHas('usuario', function ($q) use ($usuarioNombre) {
                    $q->where('nombre', 'like', "%{$usuarioNombre}%"); // Filtro para el nombre del usuario
                });
            })
            ->count(); // Contamos el total de pedidos después de aplicar los filtros
    
        // Retornar los pedidos filtrados junto con los datos del usuario y productos
        return Inertia::render('GestorPedidos', [
            'pedidos' => $pedidos->map(function ($pedido) {
                return [
                    'id' => $pedido->id,
                    'precio_total' => $pedido->precio_total,
                    'pagado' => $pedido->pagado,
                    'entregado' => $pedido->entregado,
                    'created_at' => $pedido->created_at->toIso8601String(),
                    'usuario' => [
                        'nombre' => $pedido->usuario->nombre,
                        'apellido' => $pedido->usuario->apellido,
                        'telefono' => $pedido->usuario->telefono,
                    ],
                    'productos' => $pedido->productos->map(function ($producto) {
                        return [
                            'id' => $producto->id,
                            'nombre' => $producto->nombre,
                            'precio' => $producto->precio,
                            'cantidad' => $producto->pivot->cantidad,
                            'descuento_aplicado' => $producto->pivot->descuento_aplicado,
                            'precio_pagado' => $producto->pivot->precio_pagado,
                        ];
                    }),
                ];
            }),
            'totalPedidos' => $totalPedidos, // Retornamos el total de pedidos
            'currentPage' => $pedidos->currentPage(),
            'lastPage' => $pedidos->lastPage(),
            // Retornamos los filtros aplicados
            'filters' => [
                'pagado' => $pagado,
                'entregado' => $entregado,
                'usuarioNombre' => $usuarioNombre,
            ],
        ]);
    }
    



   // Método para alternar el estado de "pagado"
/* public function togglePagado($id)
{
    $pedido = Pedido::findOrFail($id);
    $pedido->pagado = !$pedido->pagado;
    $pedido->save();

    // Redirigir a la misma página sin renderizar toda la vista
    return Inertia::location(route('gestor.pedidos'));
}

public function toggleEntregado($id)
{
    $pedido = Pedido::findOrFail($id);
    $pedido->entregado = !$pedido->entregado;
    $pedido->save();

    // Redirigir a la misma página sin renderizar toda la vista
    return Inertia::location(route('gestor.pedidos'));
}

 */
// esto em da error tthis.resolve componetne is not a function 
public function togglePagado($id)
{
    $pedido = Pedido::findOrFail($id);
    $pedido->pagado = !$pedido->pagado;
    $pedido->save();

    // Devuelve los datos actualizados del pedido
    return response()->json([
        'success' => true,
        'pedido' => $pedido,
    ]);
}

public function toggleEntregado($id)
{
    $pedido = Pedido::findOrFail($id);
    $pedido->entregado = !$pedido->entregado;
    $pedido->save();

    // Devuelve los datos actualizados del pedido
    return response()->json([
        'success' => true,
        'pedido' => $pedido,
    ]);
}




}

















   




    
















