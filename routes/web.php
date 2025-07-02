<?php

use App\Http\Controllers\TaquillaController;
use App\Http\Controllers\TiendaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\CarritoController;
use App\Http\Controllers\Pag_principalController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\VerificarAdmin;
use Inertia\Inertia;


Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Rutas de autenticación
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
Route::post('/register', [RegisteredUserController::class, 'store']);
 

//PAGINA PRINCIPAL
Route::get('/', [Pag_principalController::class, 'index'])->name('Pag_principal');
//NOSOTROS
Route::get('/nosotros', function () { return Inertia::render('Nosotros');})->name('nosotros');
//TIENDA
Route::get('/tienda', [TiendaController::class, 'index_mas_que_surf'])->name('tienda');
Route::get('/tienda-oficial', [TiendaController::class, 'index_oficial'])->name('tienda.oficial');
//CONTACTO
Route::get('/contacto', function () { return Inertia::render('Contacto');})->name('contacto');
//PRODUCTO INDIV
Route::get('/producto-ver/{productoId}', [ProductoController::class, 'ver'])->name('producto.ver');
// 
Route::get('/producto-info', function () { return Inertia::render('ProductoVer');})->name('producto.info');//ESTACREO K SOBRA

//SERVICIOS 
Route::get('/servicios', function () {return Inertia::render('Servicios');})->name('servicios');
Route::get('/servicios/surf', function () {return Inertia::render('Servicios_ClasesDeSurf');})->name('servicios.surf');
Route::get('/servicios/surf-skate', function () {return Inertia::render('Servicios_SurfSkate');})->name('servicios.surfSkate');
Route::get('/servicios/surf-trips', function () { return Inertia::render('Servicios_SurfTrips');})->name('servicios.surfTrips'); 
Route::get('/servicios/fotos', function () { return Inertia::render('Servicios_Fotos');})->name('servicios.fotografia'); 




// rutas del carrito de compra 
Route::middleware(['auth'])->group(function () {
    //CARRITO
    // Ruta para agregar productos al carrito
    Route::post('/carrito/agregar/{productoId}', [CarritoController::class, 'agregarAlCarrito'])->name('carrito.agregar');
    // Ruta para ver el carrito
    Route::get('/carrito', [CarritoController::class, 'index'])->name('carrito');
    // Ruta para eliminar productos del carrito
    Route::delete('/carrito/eliminar/{productoId}', [CarritoController::class, 'eliminarProducto'])->name('carrito.eliminar');
    Route::get('/producto-eliminado-carrito/{nombreProducto}', function ($nombreProducto) { return Inertia::render('ProductoEliminado', ['nombreProducto' => $nombreProducto]); })->name('producto.eliminado.carrito');
    //PEDIDOS
    Route::get('/pedidos', [PedidoController::class, 'mostrarPedidos'])->name('pedidos');
    Route::post('/crear-pedido', [PedidoController::class, 'crear'])->name('crear.pedido');
    Route::get('/mostrar-pedido/{id_pedido}', [PedidoController::class, 'mostrarPedido'])->name('mostrar.pedido');


});


//Aqui uso un midleware personalizado que sirve pàra unicamente permitir el acceso a los usuariso que son admin
 Route::middleware(['auth', VerificarAdmin::class])->group(function () { //verifico que este asutentificado y ademas que sea admin 
         //PRODUCTOS   // Rutas para el administrador para poder modificar productos 
        Route::get('/productos', [ProductoController::class, 'mostrarProductos'])->name('mostrar.productos');
        Route::put('/productos/{id}/eliminar', [ProductoController::class, 'desactivarProducto'])->name('producto.eliminar');
        Route::post('/productos-edit/{id}', [ProductoController::class, 'update'])->name('producto.edit');
        Route::get('/producto-store-show', function () {return  Inertia::render('CrearProducto');});
        Route::post('/producto-store', [ProductoController::class, 'store'])->name('producto.create');
        //mostrar cuando un produto se modifico o se creo corerctamente
        Route::get('/producto-modificado', function () {return Inertia::render('ProductoModificado');})->name('producto.modificado');
        Route::get('/producto-creado', function () {return Inertia::render('ProductoCreado');})->name('producto.creado');


        // TAQUILLAS: 
        //mostrar el formulario y envia al cotnrolador apra msdotrar el formulario con sus datos 
        Route::get('/asignar-taquilla-mostrar/{success?}/{usuario?}', [TaquillaController::class, 'showForm'])->name('asignar.taquilla.mostrar');
        //madna al contorlador que ejecuta todo esto de asignar la  taquilla y despues el cotnrolador iimprime la vista otra vez con mensaje de exito
         Route::post('/asignar-taquilla-usuario', [TaquillaController::class, 'AsignarTaquilla'])->name('asignar.taquilla');
         //muestro asignar taquilla con mensaje de exito;


         //GESTOR PEDIDOS
         Route::get('/gestor-pedidos', [PedidoController::class, 'index'])->name('gestor.pedidos');
         Route::get('/gestor/pedidos/filtrar', [PedidoController::class, 'applyFilter'])->name('gestor.pedidos.filtrar');
         //rutas de lso toiogles pagado y entregado
        Route::patch('/pedido/{id}/toggle-pagado', [PedidoController::class, 'togglePagado'])->name('pedido.togglePagado');
        Route::patch('/pedido/{id}/toggle-entregado', [PedidoController::class, 'toggleEntregado'])->name('pedido.toggleEntregado');


        //USUARIOS
        Route::get('/listaUsuarios', [TaquillaController::class, 'listaUsuarios'])->name('listaUsuarios');
});






// Rutas de pedidos

require __DIR__.'/auth.php';
