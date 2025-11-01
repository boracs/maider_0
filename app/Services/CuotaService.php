<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Clase de servicio responsable de la lógica de negocio 
 * relacionada con el cálculo de fechas de cuotas y su renovación.
 */
class CuotaService
{
    /**
     * Calcula las fechas de inicio y fin de un nuevo periodo de cuota.
     * * Si la cuota actual del usuario está vigente (no ha vencido), 
     * el nuevo periodo comienza el día siguiente al vencimiento.
     * Si la cuota ya venció o no tiene historial, el periodo comienza hoy.
     *
     * @param User $user El modelo de usuario que realiza el pago.
     * @param int $duracionDias La duración del plan comprado en días.
     * @return array Contiene ['periodo_inicio', 'periodo_fin'] como objetos Carbon.
     */
    public function calcularPeriodoRenovacion(User $user, int $duracionDias): array
    {
        $fechaHoy = Carbon::today();
        
        // 1. Determinar la fecha de inicio del nuevo periodo (Periodo Inicio)
        // La fecha de vencimiento actual (del caché en la tabla users)
        $fechaVencimientoActual = $user->fecha_vencimiento_cuota;

        if ($fechaVencimientoActual && $fechaVencimientoActual->isFuture()) {
            // Caso A: Renovación ANTICIPADA
            // El periodo de inicio es el día siguiente al vencimiento actual.
            $periodoInicio = $fechaVencimientoActual->copy()->addDay();
        } else {
            // Caso B: Cuota VENCIDA o Sin Historial
            // El periodo de inicio es HOY.
            $periodoInicio = $fechaHoy->copy();
        }

        // 2. Determinar la fecha de fin del nuevo periodo (Periodo Fin)
        // El periodo finaliza sumando la duración en días al periodo de inicio.
        $periodoFin = $periodoInicio->copy()->addDays($duracionDias)->subDay();

        return [
            'periodo_inicio' => $periodoInicio,
            'periodo_fin' => $periodoFin,
        ];
    }
}
