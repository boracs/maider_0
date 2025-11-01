<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Crear la tabla 'planes_taquilla'
        Schema::create('planes_taquilla', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100); // Ej: 'Plan 90 Días', 'Plan Anual'
            $table->integer('duracion_dias')->comment('Duración exacta del plan en días (ej: 90, 365).');
            $table->decimal('precio_total', 10, 2)->comment('El monto total a pagar por el plan.');
            $table->boolean('activo')->default(true)->comment('Para desactivar planes antiguos si es necesario.');
            $table->timestamps();
        });

        // 2. Crear la tabla 'pagos_cuotas'
        Schema::create('pagos_cuotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->comment('Socio que realizó el pago.');
            $table->foreignId('id_plan_pagado')->nullable()->constrained('planes_taquilla')->comment('Plan usado en este pago.');
            $table->decimal('monto_pagado', 10, 2);
            // -> CAMPO AGREGADO PARA RESOLVER EL ERROR DEL SEEDER
            $table->string('referencia_pago_externa', 50)->nullable()->comment('Referencia o ID del pago externo (Stripe, PayPal, recibo, etc.).');
            // <- FIN CAMPO AGREGADO
            $table->date('fecha_pago')->nullable()->comment('Fecha en que se registró el pago.'); // <-- FIX: Ahora es nullable
            $table->date('periodo_inicio')->comment('Fecha desde la que comienza la validez.');
            $table->date('periodo_fin')->comment('Fecha hasta la que es válido el pago.');
            $table->timestamps();
        });

        // 3. Modificar la tabla 'users' para añadir el estado de la cuota (caché de estado)
        Schema::table('users', function (Blueprint $table) {
            // A) Campo de fecha de vencimiento actual (para comprobación instantánea)
            // Asumo que 'numeroTaquilla' ya existe.
            $table->date('fecha_vencimiento_cuota')->nullable()->after('numeroTaquilla')->comment('Fecha de vigencia actual de la cuota del socio.');

            // B) Campo del plan vigente y su clave foránea
            $table->foreignId('id_plan_vigente')->nullable()->constrained('planes_taquilla')->after('fecha_vencimiento_cuota')->comment('FK al plan que actualmente da vigencia al socio.');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Al revertir, primero se eliminan las FK de 'users'
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_plan_vigente']);
            $table->dropColumn('fecha_vencimiento_cuota');
            $table->dropColumn('id_plan_vigente');
        });
        
        // Luego se eliminan las tablas nuevas
        Schema::dropIfExists('pagos_cuotas');
        Schema::dropIfExists('planes_taquilla');
    }
};
