import React from "react";

export default function UsuarioTaquillaCard({ user }) {
    const parsearFecha = (fecha) => {
        if (!fecha) return null;
        // Formato DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
            const [dia, mes, anio] = fecha.split("/").map(Number);
            return new Date(anio, mes - 1, dia);
        }
        // Formato YYYY-MM-DD o ISO
        const f = new Date(fecha);
        return isNaN(f.getTime()) ? null : f;
    };

    const formatearFecha = (fecha) => {
        const f = parsearFecha(fecha);
        if (f) return f.toLocaleDateString("es-ES");
        // Si no se puede parsear pero hay valor, mostramos el valor
        if (fecha && fecha !== "-") return fecha;
        // Si no hay fecha, mostramos un texto neutral
        return "Sin fecha";
    };

    const calcularDiasRestantes = (fechaVencimiento) => {
        const vencimiento = parsearFecha(fechaVencimiento);
        if (!vencimiento) return null;
        const hoy = new Date();
        const diffTime =
            vencimiento.setHours(0, 0, 0, 0) - hoy.setHours(0, 0, 0, 0);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const diasRestantes = calcularDiasRestantes(user.fecha_fin);

    const barraColor =
        diasRestantes === null
            ? "bg-gray-400"
            : diasRestantes >= 0
            ? "bg-gradient-to-r from-green-400 to-green-600"
            : "bg-gradient-to-r from-red-400 to-red-600";

    const porcentajeBarra =
        diasRestantes !== null && user.plan_vigente?.duracion_dias
            ? Math.max(
                  Math.min(
                      (diasRestantes / user.plan_vigente.duracion_dias) * 100,
                      100
                  ),
                  0
              )
            : 0;

    const ultimoPago = formatearFecha(user.ultimo_pago);
    const fechaFin = formatearFecha(user.fecha_fin);

    return (
        <div className="bg-gray-900/70 p-5 rounded-2xl shadow-lg mb-5 transition-transform transform hover:scale-105 hover:bg-purple-700/70">
            <h3 className="text-xl font-bold text-white mb-2">
                {user.nombre} {user.apellido} (ID: {user.id})
            </h3>

            <p className="text-sm text-gray-300 mb-1">
                <span className="font-semibold">Plan Activo:</span>{" "}
                {user.plan_vigente?.nombre ?? "Sin plan"}
            </p>

            {/* Siempre mostramos las fechas */}
            <p className="text-sm text-gray-300 mb-1">
                <span className="font-semibold">Último Pago:</span> {ultimoPago}
            </p>

            <p className="text-sm text-gray-300 mb-3">
                <span className="font-semibold">Válido Hasta:</span> {fechaFin}
            </p>

            {/* Barra de progreso */}
            <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden mb-1">
                <div
                    className={`${barraColor} h-full transition-all duration-500`}
                    style={{ width: `${porcentajeBarra}%` }}
                ></div>
            </div>

            {diasRestantes !== null && (
                <p className="text-xs text-gray-400 mt-1">
                    {diasRestantes >= 0
                        ? `${diasRestantes} días restantes`
                        : `${Math.abs(diasRestantes)} días vencidos`}
                </p>
            )}
        </div>
    );
}
