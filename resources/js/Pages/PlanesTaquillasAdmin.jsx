import React from "react";
import { Head } from "@inertiajs/react";
import Layout1 from "@/layouts/Layout1";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function PlanesTaquillasAdmin({ planes, usuarios }) {
    // Calcular días restantes de forma segura
    const calcularDiasRestantes = (fechaVencimiento) => {
        if (!fechaVencimiento) return null;
        const vencimiento = new Date(fechaVencimiento);
        if (isNaN(vencimiento)) return null;
        const hoy = new Date();
        return Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    };

    //variabel que suare para mostrar el telefono y correo del cliente en el pop up .

    const [usuarioPopup, setUsuarioPopup] = React.useState(null);
    const [detalles, setDetalles] = React.useState({});

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                usuarioPopup.current &&
                !usuarioPopup.current.contains(event.target)
            ) {
                setUsuarioPopup(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const togglePopup = async (userId) => {
        if (usuarioPopup === userId) {
            setUsuarioPopup(null);
            return;
        }

        setUsuarioPopup(userId);

        // Si ya tenemos los datos, no pedimos de nuevo
        if (!detalles[userId]) {
            try {
                const res = await fetch(`/admin/usuarios/${userId}/contacto`);
                const data = await res.json();
                setDetalles((prev) => ({
                    ...prev,
                    [userId]: data,
                }));
            } catch (err) {
                console.error(err);
                setDetalles((prev) => ({
                    ...prev,
                    [userId]: { telefono: "-", email: "-" },
                }));
            }
        }
    };

    // Enriquecemos los datos de usuarios
    const usuariosConEstado = usuarios.map((u) => {
        const dias_restantes = calcularDiasRestantes(u.fecha_fin);
        const estado =
            dias_restantes === null
                ? "sin-plan"
                : dias_restantes < 0
                ? "vencido"
                : "activo";

        return {
            ...u,
            dias_restantes,
            estado,
            ultimo_pago: u.ultimo_pago
                ? new Date(u.ultimo_pago).toLocaleDateString()
                : "-",
            fecha_fin: u.fecha_fin
                ? new Date(u.fecha_fin).toLocaleDateString()
                : "-",
        };
    });

    return (
        <Layout1>
            <Head title="Panel de Administración - Taquillas" />

            <div className="min-h-screen w-full bg-gray-900 text-gray-100 py-10 px-6">
                <div className="max-w-[1440px] mx-auto">
                    {/* ===================== TÍTULO ===================== */}
                    <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Panel de Administración de Taquillas
                    </h1>

                    {/* ===================== PLANES ===================== */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-5 text-purple-300">
                            Planes Activos
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {planes.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="bg-gray-800/70 rounded-2xl p-5 shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-1">
                                        {plan.nombre}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Duración: {plan.duracion_dias} días
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Precio: {plan.precio_total} €
                                    </p>
                                    <p
                                        className={`mt-3 inline-block px-3 py-1 text-xs rounded-full ${
                                            plan.activo
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                        }`}
                                    >
                                        {plan.activo ? "Activo" : "Inactivo"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ===================== LISTA GENERAL ===================== */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-5 text-purple-300">
                            Lista General de Usuarios
                        </h2>

                        <div className="overflow-x-auto rounded-xl bg-gray-800/70 p-6 shadow-lg relative">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-300 border-b border-gray-700/70">
                                        <th className="text-left py-2">ID</th>
                                        <th className="text-left py-2">
                                            Usuario
                                        </th>
                                        <th className="text-left py-2">
                                            Plan Activo
                                        </th>
                                        <th className="text-left py-2">
                                            Último Pago
                                        </th>
                                        <th className="text-left py-2">
                                            Vence
                                        </th>
                                        <th className="text-left py-2 w-64">
                                            Progreso
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosConEstado.map((u) => {
                                        const porcentaje =
                                            u.plan_vigente?.duracion_dias &&
                                            u.dias_restantes !== null
                                                ? Math.max(
                                                      0,
                                                      Math.min(
                                                          (u.dias_restantes /
                                                              u.plan_vigente
                                                                  .duracion_dias) *
                                                              100,
                                                          100
                                                      )
                                                  )
                                                : 0;

                                        // Color según % días restantes
                                        let color;
                                        if (u.dias_restantes === null) {
                                            color = "from-gray-400 to-gray-500";
                                        } else if (
                                            u.dias_restantes /
                                                u.plan_vigente.duracion_dias >=
                                            0.7
                                        ) {
                                            color =
                                                "from-green-400 to-green-600";
                                        } else if (
                                            u.dias_restantes /
                                                u.plan_vigente.duracion_dias >=
                                            0.3
                                        ) {
                                            color =
                                                "from-yellow-400 to-yellow-600";
                                        } else {
                                            color = "from-red-500 to-red-700";
                                        }

                                        return (
                                            <tr
                                                key={u.id}
                                                className="border-b border-gray-700/50 hover:bg-purple-800/20 hover:scale-105 transition-transform duration-300 ease-in-out"
                                            >
                                                <td className="py-3">{u.id}</td>
                                                <td className="py-3">
                                                    <span className="font-medium text-white">
                                                        {u.nombre} {u.apellido}
                                                    </span>
                                                    <span className="block text-xs text-gray-400">
                                                        Taquilla #
                                                        {u.numeroTaquilla ??
                                                            "-"}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    {u.plan_vigente?.nombre ??
                                                        "-"}
                                                </td>
                                                <td className="py-3">
                                                    {u.ultimo_pago}
                                                </td>
                                                <td className="py-3">
                                                    {u.fecha_fin}
                                                </td>
                                                <td className="py-3">
                                                    <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden z-0">
                                                        {/* Días restantes */}
                                                        {u.dias_restantes >
                                                            0 && (
                                                            <div
                                                                className="absolute left-0 top-0 h-2 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                                                                style={{
                                                                    width: `${
                                                                        (u.dias_restantes /
                                                                            u
                                                                                .plan_vigente
                                                                                .duracion_dias) *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            />
                                                        )}

                                                        {/* Días vencidos */}
                                                        {u.dias_restantes <
                                                            0 && (
                                                            <div
                                                                className={`absolute left-0 top-0 h-2 bg-gradient-to-r ${color} transition-all duration-500`}
                                                                style={{
                                                                    width: `${
                                                                        u.dias_restantes >=
                                                                        0
                                                                            ? (u.dias_restantes /
                                                                                  u
                                                                                      .plan_vigente
                                                                                      .duracion_dias) *
                                                                              100
                                                                            : (-u.dias_restantes /
                                                                                  u
                                                                                      .plan_vigente
                                                                                      .duracion_dias) *
                                                                              100
                                                                    }%`,
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    <p className="text-xs mt-1 text-gray-400">
                                                        {u.dias_restantes ===
                                                        null
                                                            ? "Sin plan"
                                                            : u.dias_restantes >
                                                              0
                                                            ? `${u.dias_restantes} días restantes`
                                                            : u.dias_restantes ===
                                                              0
                                                            ? "Vence hoy"
                                                            : `${Math.abs(
                                                                  u.dias_restantes
                                                              )} días vencido`}
                                                    </p>
                                                </td>
                                                <td className="py-3 flex items-center justify-between">
                                                    <td className="py-3 relative flex items-center justify-between">
                                                        <td className="py-3 relative flex items-center justify-between">
                                                            <button
                                                                onClick={() =>
                                                                    togglePopup(
                                                                        u.id
                                                                    )
                                                                }
                                                                className="ml-3 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                                                                title="Ver datos"
                                                            >
                                                                {/* icono */}
                                                            </button>

                                                            {/* Pop-up */}
                                                        </td>

                                                        {/* Pop-up */}
                                                        {usuarioPopup ===
                                                            u.id &&
                                                            detalles[u.id] && (
                                                                <div
                                                                    className="absolute right-0 w-72 bg-white p-6 rounded-2xl shadow-2xl text-gray-900 border border-gray-300 transition-all duration-300 z-[50]"
                                                                    onMouseLeave={() =>
                                                                        setUsuarioPopup(
                                                                            null
                                                                        )
                                                                    } // Se cierra al salir
                                                                >
                                                                    <div className="space-y-4">
                                                                        <p className="text-sm">
                                                                            <span className="font-semibold">
                                                                                Teléfono:
                                                                            </span>{" "}
                                                                            {
                                                                                detalles[
                                                                                    u
                                                                                        .id
                                                                                ]
                                                                                    .telefono
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm">
                                                                            <span className="font-semibold">
                                                                                Email:
                                                                            </span>{" "}
                                                                            {
                                                                                detalles[
                                                                                    u
                                                                                        .id
                                                                                ]
                                                                                    .email
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </td>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </Layout1>
    );
}
