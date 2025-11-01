<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * Controlador para la administración de usuarios, enfocado en la gestión del estado de la cuota.
 * Maneja la lista de socios vigentes, en mora, y su historial de pagos.
 */
class UserTaquillaController extends Controller
{
    /**
     * Muestra una lista de todos los usuarios/socios con su estado de cuota.
     * Endpoint: GET /api/admin/socios
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // 1. Obtener todos los usuarios que son socios (tienen numeroTaquilla)
        $sociosQuery = User::whereNotNull('numeroTaquilla')
            ->orderBy('nombre', 'asc')
            ->orderBy('apellido', 'asc');

        $totalSocios = $sociosQuery->count();
        
        // 2. Obtener los vigentes y en mora por separado (usando los Scopes)
        $vigentes = (clone $sociosQuery)->vigentes()->get();
        $enMora = (clone $sociosQuery)->enMora()->get();
        
        // 3. Obtener todos los socios con su estado de vigencia
        $todosSocios = $sociosQuery->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'nombre_completo' => $user->nombre . ' ' . $user->apellido,
                'email' => $user->email,
                'numero_taquilla' => $user->numeroTaquilla,
                'vencimiento_cuota' => $user->fecha_vencimiento_cuota?->format('Y-m-d') ?? 'N/A',
                // Usamos el accesor 'cuota_vigente' para el estado
                'estado' => $user->cuota_vigente ? 'Vigente' : 'En Mora',
            ];
        });

        return response()->json([
            'resumen' => [
                'total_socios' => $totalSocios,
                'vigentes_count' => $vigentes->count(),
                'en_mora_count' => $enMora->count(),
            ],
            'lista_socios' => $todosSocios
        ]);
    }

    /**
     * Muestra el detalle del historial de pagos de un socio específico.
     * Endpoint: GET /api/admin/socios/{id}
     *
     * @param  int  $id El ID del usuario/socio.
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id)
    {
        $user = User::where('id', $id)
                    ->whereNotNull('numeroTaquilla') // Solo si es socio
                    ->with(['pagos.plan', 'planVigente']) // Carga el historial de pagos y el plan actual
                    ->firstOrFail();

        return response()->json([
            'socio_info' => [
                'id' => $user->id,
                'nombre_completo' => $user->nombre . ' ' . $user->apellido,
                'email' => $user->email,
                'numero_taquilla' => $user->numeroTaquilla,
                'estado_cuota' => $user->cuota_vigente ? 'Vigente' : 'En Mora',
                'vencimiento_actual' => $user->fecha_vencimiento_cuota?->format('Y-m-d') ?? 'N/A',
                'plan_vigente' => $user->planVigente?->nombre ?? 'Ninguno',
            ],
            'historial_pagos' => $user->pagos
        ]);
    }
}
