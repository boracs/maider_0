<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Representa los planes maestros de la taquilla.
 * Corresponde a la tabla 'planes_taquilla'.
 */
class PlanTaquilla extends Model
{
    use HasFactory;

    protected $table = 'planes_taquilla';

    protected $fillable = [
        'nombre',
        'duracion_dias',
        'precio_total',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'duracion_dias' => 'integer',
        'precio_total' => 'float',
    ];
    
    /**
     * Relación: Un Plan puede estar vigente para muchos usuarios (FK: users.id_plan_vigente).
     */
    public function usuariosVigentes()
    {
        return $this->hasMany(User::class, 'id_plan_vigente');
    }

    /**
     * Relación: Un Plan ha sido comprado en muchos pagos históricos (FK: pagos_cuotas.id_plan_pagado).
     */
    public function pagosHistoricos()
    {
        return $this->hasMany(PagoCuota::class, 'id_plan_pagado');
    }
}
