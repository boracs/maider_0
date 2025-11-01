<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;

/**
 * Controlador para manejar la autenticación (login y generación de tokens de API).
 */
class AuthController extends Controller
{
    /**
     * Maneja la solicitud de login del administrador.
     * Genera un token de Sanctum si las credenciales son válidas y el rol es 'admin'.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function login(Request $request): JsonResponse
    {
        // 1. Validación de la solicitud
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // 2. Intentar autenticar al usuario
        if (!Auth::attempt($request->only('email', 'password'))) {
            // Si las credenciales son inválidas
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Obtener el usuario autenticado
        $user = $request->user();

        // 3. Verificación de Rol (CRÍTICO: Solo el 'admin' puede obtener este token)
        if ($user->role !== 'admin') {
            // Cierra la sesión (por seguridad)
            Auth::logout();
            
            throw ValidationException::withMessages([
                'email' => ['Acceso denegado. Solo los administradores pueden acceder a la Taquilla.'],
            ]);
        }

        // 4. Generación del Token de Sanctum
        // El nombre es 'admin-token' y tiene la habilidad 'server:admin'
        // NOTA: El hash de este token se guarda automáticamente en personal_access_tokens
        $token = $user->createToken('admin-token', ['server:admin'])->plainTextToken;

        // 5. Respuesta exitosa
        return response()->json([
            'message' => 'Autenticación de administrador exitosa.',
            'admin_user' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'email' => $user->email,
                'role' => $user->role,
            ],
            // IMPORTANTE: Devolvemos el token de texto plano que el frontend debe guardar
            'token' => $token, 
        ]);
    }

    /**
     * Maneja la solicitud de logout, eliminando el token de Sanctum.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        // Elimina el token actual que se usó para autenticar esta solicitud
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada y token revocado correctamente.'
        ]);
    }
}
