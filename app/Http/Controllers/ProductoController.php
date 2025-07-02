<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Producto;

use Inertia\Inertia;

class ProductoController extends Controller
{

    public function update(Request $request, $id)
    {
        // Obtener el producto o lanzar un error si no se encuentra
        $producto = Producto::findOrFail($id);
    
        // Validación de los campos, incluyendo la imagen (si se proporciona)
        $request->validate([
            'nombre' => 'required|string',
            'precio' => 'required|numeric',
            'unidades' => 'required|integer',
            'descuento' => 'nullable|numeric',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048', // Validar imagen si es proporcionada
        ]);
    
        // Manejo de la imagen (si se proporciona una nueva imagen)
        if ($request->hasFile('imagen') && $request->file('imagen')->isValid()) {
            \Log::info('Procesando imagen...');
            $imagenPath = $request->file('imagen')->store('productos', 'public');
            \Log::info('Imagen almacenada en: ' . $imagenPath);
            $producto->imagen = basename($imagenPath);
        } else {
            \Log::info('No se ha recibido una imagen válida.');
        }
    
        // Actualizar los demás campos del producto
        $producto->nombre = $request->input('nombre');
        $producto->precio = $request->input('precio');
        $producto->unidades = $request->input('unidades');
        $producto->descuento = $request->input('descuento', 0);
    
        // Guardar los cambios en el producto
        $producto->save();
    
        // Retornar la respuesta
        return redirect()->route('mostrar.productos')->with('success', 'Producto actualizado correctamente');
    }
    





    //moastrar en contenedor d eprodcutos los 4 con amyor descuento
    public function index()
    {
        // Obtener los 4 productos con mayor descuento
        $productos = Producto::orderBy('descuento', 'desc')->take(4)->get();

        // Pasar los productos al componente de Inertia
        return Inertia::render('Productos', [
            'productos' => $productos,
        ]);
    }




    public function mostrarProductos()
    {
        // Obtener todos los productos
        $productos = Producto::all(); // Aquí puedes aplicar filtros si lo deseas
        // Pasar los productos a Inertia
        return Inertia::render('Productos', [
            'productos' => $productos
        ]);
    }




    public function desactivarProducto($id)
    {
        $producto = Producto::findOrFail($id);

        // Cambiar el estado de "eliminado"
        $producto->eliminado = !$producto->eliminado;  // Cambia entre true y false
        $producto->save();

        // Retornar la redirección con el nombre del producto
        return redirect()->route('mostrar.productos');
    }



    public function MostrarCrearProducto(Request $request)
    {
        // Validación y creación de un nuevo producto
        $producto = Producto::create($request->all());

        // Después de crear el producto, redirigimos a la vista de React
        return view('productos.crear', compact('producto')); // Aquí renderizamos una vista con el producto creado
    }



    public function store(Request $request)
    {
            /*       // Validación de los datos
                    $validated = $request->validate([
                        'nombre' => 'required|string|max:255',
                        'precio' => 'required|numeric',
                        'unidades' => 'required|integer',
                        'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                        'descuento' => 'nullable|numeric',
                        'eliminado' => 'nullable|boolean',
                    ]);
                */

        // Procesamiento de la imagen si existe
        $imagePath = null; // Inicializa la variable
        if ($request->hasFile('imagen')) {
            // Guarda el archivo de manera manual
            $image = $request->file('imagen');
            $imagePath = $image->storeAs('productos', $image->getClientOriginalName(), 'public');
        }
    
        // Crear el producto
        $producto = new Producto();
                $producto->fill([
                'nombre' => $request->input('nombre'),
                'precio' => $request->input('precio'),
                'unidades' => $request->input('unidades'),
                'imagen' => $imagePath,
                'descuento' => $request->input('descuento'),
                'eliminado' => $request->input('eliminado') ? 1 : 0, // Cambia 'false' y 'true' por 0 y 1
            ]);
        $producto->save();
    
        // Redirigir a una página de éxito (o a donde sea necesario)
        return Inertia::location(route('producto.creado', ['productoId' => $producto->id]));

    }




    public function ver($id)
{
    $producto = Producto::findOrFail($id); // Obtén el producto
    $usuario = auth()->user(); // Obtén el usuario autenticado
    return Inertia::render('ProductoVer', [
        'producto' => $producto,
        'usuario' => $usuario, // Pasa el usuario al frontend
    ]);
}







}