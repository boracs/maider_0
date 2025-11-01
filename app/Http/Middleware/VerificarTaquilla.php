<?php


namespace App\Http\Middleware; // ESTE ES EL NAMESPACE CORRECTO

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class VerificarTaquilla // ESTE DEBE SER EL NOMBRE DE CLASE EXACTO
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Verificar si el usuario está autenticado.
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // 2. Verificar si el usuario tiene asignado un número de taquilla.
        // Usamos la columna 'numeroTaquilla' de tu esquema.
        if ($user->numeroTaquilla === null) {
            // Si no tiene taquilla, lo redirigimos a la tienda con un mensaje de error
            return redirect()->route('tienda')->with('error', 'Debes tener una taquilla asignada para acceder a esta funcionalidad.');
        }

        // Si el usuario está logueado Y tiene taquilla, permitimos el acceso.
        return $next($request);
    }
}
