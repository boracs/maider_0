<?php

namespace App\Http\Controllers;

use App\Models\PagoCuota;
use App\Models\User;
use App\Models\PlanTaquilla; // Necesario para obtener el plan seleccionado
use App\Services\CuotaService; // Necesario para la lógica de fechas y renovación
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage; // Necesario para subir la imagen
use Illuminate\Validation\Rule;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Controlador de la API para la gestión del historial de pagos de taquillas.
 * Adaptado para manejar el flujo de RENOVACIÓN AUTOMÁTICA por el cliente al subir un justificante.
 */
class PagoCuotaController extends Controller
{
    protected CuotaService $cuotaService;

    public function __construct(CuotaService $cuotaService)
    {
        $this->cuotaService = $cuotaService;
    }
    
    /**
     * Muestra una lista paginada de los pagos de cuotas (HISTÓRICO y JUSTIFICANTES).
     * Esta es la vista detallada del ADMINISTRADOR para auditoría.
     * Incluye el `justificante_url` que pidió el cliente.
     * * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $perPage = $request->get('per_page', 25); 

        $query = PagoCuota::with(['user', 'plan'])
            ->latest(); 

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('id', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function (Builder $userQuery) use ($search) {
                        $userQuery->where('nombre', 'like', '%' . $search . '%')
                                  ->orWhere('apellido', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('plan', function (Builder $planQuery) use ($search) {
                        $planQuery->where('nombre', 'like', '%' . $search . '%');
                    });
            });
        }
        
        $pagos = $query->paginate($perPage);

        return response()->json($pagos);
    }

    /**
     * [NUEVO ENDPOINT PARA ADMIN/USUARIO] - Obtiene el estado de vigencia de todos los usuarios
     * para dibujar la barra de tiempo (rojo/verde).
     * * @return \Illuminate\Http\JsonResponse
     */
    public function getAllUsersVigencyStatus()
    {
        // El frontend necesita:
        // 1. Nombre/ID del usuario
        // 2. Fecha de Vencimiento (para saber si está en rojo o verde)
        // 3. ID del Plan Vigente
        
        // Usamos el scope `esSocio` definido en el modelo User (asumimos que existe)
        $users = User::select([
                'id', 
                'nombre', 
                'apellido', 
                'numeroTaquilla',
                'fecha_vencimiento_cuota', 
                'id_plan_vigente'
            ])
            // Solo aquellos que tienen un número de taquilla asignado
            ->whereNotNull('numeroTaquilla') 
            // Carga el nombre del plan vigente si existe
            ->with('planVigente:id,nombre,duracion_dias') 
            ->get();
            
        // El accesor `cuota_vigente` en el modelo User se encarga de determinar el estado (rojo/verde)
        // en tiempo real al acceder al modelo.

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * [LÓGICA AUTOMÁTICA] - Procesa el registro de pago por parte del USUARIO.
     * Basado en el `monto_pagado`, el sistema encuentra el plan, calcula fechas y renueva.
     * * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // 1. Validar los datos de la solicitud (incluyendo la foto)
        $validated = $request->validate([
            'monto_pagado' => 'required|numeric|min:0.01',
            'fecha_pago_banco' => 'required|date|before_or_equal:today', 
            'justificante' => 'required|image|mimes:jpeg,png,jpg,pdf|max:5120', // Ampliado a 5MB y permitiendo PDF
        ]);

        $user = $request->user();

        // 2. Mapear el monto al PlanTaquilla (lógica de negocio CRÍTICA)
        $plan = PlanTaquilla::whereRaw('CAST(precio_total AS DECIMAL(10, 2)) = ?', [$validated['monto_pagado']])
                            ->where('activo', true)
                            ->first();

        if (!$plan) {
            return response()->json([
                'message' => 'El monto ingresado (' . number_format($validated['monto_pagado'], 2) . ') no coincide con el precio de ninguno de nuestros planes activos.',
                'sugerencia' => 'Por favor, asegúrese de que el monto sea exacto según la tarifa.'
            ], 422); 
        }

        // 3. Subir el justificante al almacenamiento (storage)
        try {
            DB::beginTransaction();
            
            $fileExtension = $request->file('justificante')->extension();
            $fileName = $user->id . '-' . time() . '.' . $fileExtension;
            $path = $request->file('justificante')->storeAs('justificantes_pagos', $fileName, 'public');
            $justificanteUrl = Storage::url($path);
            
            // 4. Calcular las fechas de renovación usando el servicio
            $periodos = $this->cuotaService->calcularPeriodoRenovacion($user, $plan->duracion_dias);

            // 5. Crear el registro en el histórico de pagos (pagos_cuotas)
            $pago = PagoCuota::create([
                'user_id' => $user->id,
                'id_plan_pagado' => $plan->id,
                'monto_pagado' => $validated['monto_pagado'],
                'fecha_pago' => Carbon::parse($validated['fecha_pago_banco']), 
                'periodo_inicio' => $periodos['periodo_inicio'],
                'periodo_fin' => $periodos['periodo_fin'],
                'justificante_url' => $justificanteUrl, // Guardamos la URL
            ]);

            // 6. Actualizar el caché de estado del usuario (CRÍTICO)
            $user->update([
                'fecha_vencimiento_cuota' => $periodos['periodo_fin'],
                'id_plan_vigente' => $plan->id,
            ]);
            
            DB::commit();

            return response()->json([
                'message' => '¡Pago registrado y cuota renovada con éxito!',
                'vigencia_hasta' => $periodos['periodo_fin']->format('Y-m-d'),
                'pago' => $pago->load('plan')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // Si la transacción falla, eliminamos el archivo subido si existe
            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }
            return response()->json([
                'message' => 'Error al procesar la renovación. Inténtalo de nuevo.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Muestra el historial de pagos para un usuario específico.
     * * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $userId)
    {
        $pagos = PagoCuota::where('user_id', $userId)
            ->with('plan') 
            ->orderByDesc('periodo_inicio')
            ->get();

        if ($pagos->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron pagos para el usuario ID: ' . $userId,
                'data' => []
            ], 404);
        }

        return response()->json([
            'user_id' => $userId,
            'data' => $pagos
        ]);
    }
}
