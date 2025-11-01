<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth; // Mantener por si se necesita, aunque no se usa directamente

class VerificarAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Verifica si hay un usuario autenticado
        if (!auth()->check()) {
            // Si no está autenticado (no hay token válido), devuelve 401 Unauthorized
            return response()->json([
                'message' => 'No autenticado. Por favor, inicia sesión.'
            ], 401);
        }

        // 2. Verifica si el usuario autenticado tiene el rol 'admin'
        if (auth()->user()->role === 'admin') {
            return $next($request);
        }

        // 3. Si está autenticado pero no es admin, devuelve 403 Forbidden
        // Este es el error correcto para el acceso denegado en una API.
        return response()->json([
            'message' => 'Acceso denegado. Se requiere rol de administrador.'
        ], 403);
    }
}
