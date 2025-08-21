<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\Imagen;
use Inertia\Inertia;

class ProductoController extends Controller
{
    /**
     * Actualizar un producto existente
     */
   public function update(Request $request, $id)
{
    $producto = Producto::findOrFail($id);

    $request->validate([
        'nombre' => 'required|string|max:255',
        'precio' => 'required|numeric',
        'unidades' => 'required|integer',
        'descuento' => 'nullable|numeric',
        'imagenes.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
    ]);

    // Actualizar datos del producto
    $producto->update([
        'nombre' => $request->input('nombre'),
        'precio' => $request->input('precio'),
        'unidades' => $request->input('unidades'),
        'descuento' => $request->input('descuento', 0),
    ]);

    // Subir imágenes nuevas (si las hay)
    if ($request->hasFile('imagenes')) {
        foreach ($request->file('imagenes') as $image) {
            $imagePath = $image->store('productos', 'public');

            $imagen = new Imagen();
            $imagen->nombre = $image->getClientOriginalName();
            $imagen->ruta = $imagePath;
            $imagen->producto_id = $producto->id;
            $imagen->es_principal = false; // en update normalmente se añaden como secundarias
            $imagen->save();
        }
    }

    return redirect()->route('mostrar.productos')->with('success', 'Producto actualizado correctamente');
}
    /**
     * Mostrar los 4 productos con mayor descuento
     */
    public function index()
    {
        // Obtener los 4 productos con mayor descuento, con imágenes
        $productos = Producto::with('imagenes')
            ->orderBy('descuento', 'desc')
            ->take(4)
            ->get();

        // Pasar los productos al componente de Inertia
        return Inertia::render('Productos', [
            'productos' => $productos,
        ]);
    }

    /**
     * Mostrar todos los productos
     */
  public function mostrarProductos()
{
    $productos = Producto::with('imagenes', 'imagenPrincipal')->get();

    return Inertia::render('Productos', [
        'productos' => $productos
    ]);
}

    /**
     * Activar o desactivar un producto
     */
    public function desactivarProducto($id)
    {
        $producto = Producto::findOrFail($id);

        // Cambiar el estado de "eliminado"
        $producto->eliminado = !$producto->eliminado;  // Cambia entre true y false
        $producto->save();

        // Retornar la redirección con el nombre del producto
        return redirect()->route('mostrar.productos');
    }

    /**
     * Mostrar la vista de crear producto
     */
    public function MostrarCrearProducto(Request $request)
    {
        // Validación y creación de un nuevo producto
        $producto = Producto::create($request->all());

        // Después de crear el producto, redirigimos a la vista de React
        return view('productos.crear', compact('producto'));
    }

    /**
     * Crear un nuevo producto con su imagen
     */

    
public function store(Request $request)
{
    // Validar los campos del producto
    $request->validate([
        'nombre' => 'required|string|max:255',
        'precio' => 'required|numeric',
        'unidades' => 'required|integer',
        'descuento' => 'nullable|numeric',
        'eliminado' => 'nullable|boolean',
        'imagenes.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048', // varias imágenes
    ]);

    // Crear el producto
    $producto = new Producto();
    $producto->fill([
        'nombre' => $request->input('nombre'),
        'precio' => $request->input('precio'),
        'unidades' => $request->input('unidades'),
        'descuento' => $request->input('descuento', 0),
        'eliminado' => $request->input('eliminado', false),
    ]);
    $producto->save();

    // Procesar múltiples imágenes (si existen)
    if ($request->hasFile('imagenes')) {
        foreach ($request->file('imagenes') as $index => $image) {
            $imagePath = $image->store('productos', 'public');

            $imagen = new Imagen();
            $imagen->nombre = $image->getClientOriginalName();
            $imagen->ruta = $imagePath;
            $imagen->producto_id = $producto->id;
            $imagen->es_principal = $index === 0; // la primera subida es la principal
            $imagen->save();
        }
    }

    // Redirigir a la lista de productos (Productos.jsx)
    return redirect()->route('mostrar.productos')->with('success', 'Producto creado correctamente');
}









    /**
     * Ver un producto en detalle
     */
    public function ver($id)
    {
        $producto = Producto::with('imagenes')->findOrFail($id); // Cargar producto con imágenes
        $usuario = auth()->user(); // Obtener el usuario autenticado

        return Inertia::render('ProductoVer', [
            'producto' => $producto,
            'usuario' => $usuario,
        ]);
    }





    // CREAR PRODUCTO 

public function crear()
{
    return Inertia::render('CrearProducto');
}

}