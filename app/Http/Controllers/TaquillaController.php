<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;

class TaquillaController extends Controller
{


    public function showForm($success = null)
    {
        // Obtener todos los usuarios ordenados alfabéticamente por nombre y apellido
        $usuarios = User::orderBy('nombre')->orderBy('apellido')->get();
    
        // Pasar el parámetro 'success' como prop
        return Inertia::render('AsignarTaquilla', [
            'usuarios' => $usuarios,
            'success' => $success  // Pasar 'success' como parte de las props
        ]);
    }

    // Método para asignar la taquilla
    public function AsignarTaquilla(Request $request)
        {
            // Validar el formulario
            $request->validate([
                'usuario_id' => 'required',
                'numero_taquilla' => 'required|integer',
            ]);

            // Buscar al usuario
            $usuario = User::findOrFail($request->usuario_id);

            // Asignar la taquilla
            $usuario->numeroTaquilla = $request->numero_taquilla;
            $usuario->save();

            // Redirigir a la misma página con el mensaje de éxito usando Inertia
            return Inertia::location(route('asignar.taquilla.mostrar') . '?success=true');
        }



}