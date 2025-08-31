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

    // Validación
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

    // Si hay imágenes nuevas, eliminar las antiguas y subir las nuevas
    if ($request->hasFile('imagenes')) {

        // Eliminar imágenes antiguas
        foreach ($producto->imagenes as $imagen) {
            if (\Storage::disk('public')->exists($imagen->ruta)) {
                \Storage::disk('public')->delete($imagen->ruta);
            }
            $imagen->delete();
        }

        // Subir imágenes nuevas
        foreach ($request->file('imagenes') as $index => $image) {
            $imagePath = $image->store('productos', 'public');

            $producto->imagenes()->create([
                'nombre' => $image->getClientOriginalName(),
                'ruta' => $imagePath,
                'es_principal' => $index === 0 ? true : false, // Primera imagen principal
            ]);
        }
    }

    return redirect()->route('mostrar.productos')
        ->with('success', 'Producto actualizado correctamente');
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
            $productos = Producto::with('imagenes')->get()->map(function ($producto) {
                $imagenPrincipal = $producto->imagenes->firstWhere('es_principal', 1);

                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'precio' => $producto->precio,
                    'unidades' => $producto->unidades,
                    'descuento' => $producto->descuento,
                    'eliminado' => $producto->eliminado,
                    'imagen_principal' => $imagenPrincipal ? asset('storage/' . $imagenPrincipal->ruta) : null,
                ];
            });

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
    $producto = Producto::with('imagenes')->findOrFail($id);
    $usuario = auth()->user();

    // Preparar imágenes con ruta completa
    $imagenes = $producto->imagenes->map(fn($img) => [
        'id' => $img->id,
        'ruta' => asset('storage/' . $img->ruta),
        'es_principal' => (bool)$img->es_principal,
    ])->sortByDesc('es_principal')->values(); // Principal primero

    // Preparar producto para frontend
    $productoParaFrontend = [
        'id' => $producto->id,
        'nombre' => $producto->nombre,
        'precio' => $producto->precio,
        'unidades' => $producto->unidades,
        'descuento' => $producto->descuento,
        'imagenes' => $imagenes,
        'imagen_principal' => $imagenes->first()['ruta'] ?? asset('img/placeholder.jpg'),
    ];

    return Inertia::render('ProductoVer', [
        'producto' => $productoParaFrontend,
        'usuario' => $usuario,
    ]);
}





    // CREAR PRODUCTO 

public function crear()
{
    return Inertia::render('CrearProducto');
}



//OBTENER IMAGENES DEL PRODUCTO SELECCIONADO
public function obtenerImagenes(Producto $producto)
{
    $imagenes = $producto->imagenes->map(fn($img) => [
        'id' => $img->id,
        'url' => asset('storage/' . $img->ruta),
        'es_principal' => $img->es_principal,
    ]);

    // Reordenamos para que la principal vaya al principio
    $imagenes = $imagenes->sortByDesc('es_principal')->values();

    return response()->json(['imagenes' => $imagenes]);
}


//CAMBIAR LA IMAGENE PRINCIPAL
public function cambiarImagenPrincipal(Request $request, Producto $producto)
{

     $request->validate([
        'imagen_id' => 'required|integer|exists:imagenes,id',
    ]);

    $imagenId = $request->input('imagen_id');

    // Resetear la principal actual
    $producto->imagenes()->update(['es_principal' => 0]);

    // Asignar nueva principal
    $producto->imagenes()->where('id', $imagenId)->update(['es_principal' => 1]);

    return response()->json(['success' => true]);
}













}