<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PagoCuota extends Model
{
    use HasFactory;

    // ✅ Tabla correcta
    protected $table = 'pagos_cuotas';

    protected $fillable = [
        'user_id',
        'id_plan_pagado',
        'monto_pagado',
        'referencia_pago_externa',
        'periodo_inicio',
        'periodo_fin',
        'fecha_pago',
    ];

   protected $casts = [
    'periodo_inicio' => 'datetime',
    'periodo_fin' => 'datetime',    
    'fecha_pago' => 'datetime',     
    'monto_pagado' => 'float',
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(PlanTaquilla::class, 'id_plan_pagado');
    }

    public function getDuracionDiasAttribute()
    {
        return $this->periodo_inicio && $this->periodo_fin
            ? $this->periodo_inicio->diffInDays($this->periodo_fin)
            : 0;
    }
}
