<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatbotController; // Asegúrate de importar tu controlador

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aquí es donde puedes registrar rutas API para tu aplicación. Estas
| rutas son cargadas por el RouteServiceProvider dentro de un grupo
| que tiene el middleware "api". ¡Disfruta construyendo tu API!
|
*/

// Opcional: Ruta de ejemplo que Laravel usa por defecto
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// 💡 RUTA DEL CHATBOT
// React hará POST a http://tu-app.test/api/chatbot/message
Route::post('/chatbot/message', [ChatbotController::class, 'handleMessage']);