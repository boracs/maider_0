import React from "react";
import { usePage } from "@inertiajs/react";
import Layout1 from "../layouts/Layout1"; // Asegúrate de que esta ruta sea correcta

// Función auxiliar para formatear fechas
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Utiliza la configuración local para un formato legible
    return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Función auxiliar para determinar el estado visual del pedido
const getEstadoPedido = (isPaid, isDelivered) => {
    // 1. Verde: Pagado (true) y entregado (true)
    if (isPaid && isDelivered) {
        return {
            text: "Pagado y Entregado",
            color: "Verde",
            className: "bg-green-100 text-green-800 border-green-500",
        };
    }
    // 2. Rojo: Entregado (true) pero no pagado (false)
    if (isDelivered && !isPaid) {
        return {
            text: "Entregado, Pago Pendiente",
            color: "Rojo",
            className: "bg-red-100 text-red-800 border-red-500",
        };
    }
    // 3. Amarillo: Pagado (true) pero no entregado (false)
    if (isPaid && !isDelivered) {
        return {
            text: "Pagado, Pendiente de Envío",
            color: "Amarillo",
            className: "bg-yellow-100 text-yellow-800 border-yellow-500",
        };
    }
    // 4. Gris: No pagado (false) y no entregado (false)
    return {
        text: "Pendiente de Pago y Envío",
        color: "Gris",
        className: "bg-gray-100 text-gray-700 border-gray-500",
    };
};

const ConfirmacionPedido = () => {
    // Extraemos el objeto 'pedido' que Laravel nos envía con toda la información anidada
    const { pedido } = usePage().props;

    // Función auxiliar para formatear moneda
    const formatCurrency = (value) =>
        new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);

    // EXTRACCIÓN Y DEFENSA CONTRA UNDEFINED
    const productosDelPedido = pedido?.productos || [];
    const totalFinal = pedido?.precio_total || 0;
    const id_pedido = pedido?.id;

    // Información clave
    const fechaRealizacion = pedido?.created_at
        ? formatDate(pedido.created_at)
        : "Pendiente";
    const fechaEntregaEstimada = pedido?.fecha_entrega
        ? formatDate(pedido.fecha_entrega)
        : "No especificada";

    // Determinar el estado visual
    const estadoVisual = getEstadoPedido(pedido?.pagado, pedido?.entregado);

    // Manejo de estado de carga/error
    if (!pedido) {
        // Esto debería ocurrir si el usuario intenta acceder a un pedido que no existe o no le pertenece (404)
        return (
            <Layout1>
                <div className="text-center py-20 text-xl text-gray-700">
                    No se pudo cargar el pedido o no existe.
                </div>
            </Layout1>
        );
    }

    return (
        <Layout1>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
                <div className="max-w-4xl w-full bg-white p-8 rounded-xl shadow-2xl">
                    <h2 className="text-4xl font-extrabold text-green-600 mb-2 text-center">
                        ¡Pedido Confirmado!
                    </h2>

                    {/* ESTADO DEL PEDIDO */}
                    <div
                        className={`p-3 rounded-lg border-l-8 font-bold text-center text-xl mb-6 ${estadoVisual.className}`}
                    >
                        Estado del Pedido: {estadoVisual.text}
                    </div>

                    <p className="text-xl text-gray-700 mb-6 text-center">
                        Gracias por tu compra. Tu pedido{" "}
                        <span className="font-bold">#{id_pedido}</span> ha sido
                        registrado.
                    </p>

                    {/* DATOS CLAVE DEL PEDIDO */}
                    <div className="flex justify-around bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-6 text-gray-700">
                        <div className="text-center">
                            <p className="font-semibold text-lg">
                                Fecha de Pedido:
                            </p>
                            <p className="text-xl">{fechaRealizacion}</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">
                                Entrega Estimada:
                            </p>
                            <p className="text-xl">{fechaEntregaEstimada}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-lg shadow-inner mb-6">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                            Resumen de Productos
                        </h3>
                        <ul className="space-y-4">
                            {productosDelPedido.map((producto) => {
                                // Usamos los datos guardados en la tabla pivote para la máxima precisión
                                const cantidad = producto.pivot.cantidad;
                                const precioPagadoUnidad =
                                    producto.pivot.precio_pagado || 0;
                                const subtotal = precioPagadoUnidad * cantidad;

                                return (
                                    <li
                                        key={producto.id}
                                        className="flex justify-between items-start border-b border-gray-200 py-3 last:border-b-0"
                                    >
                                        <div className="flex flex-col">
                                            <p className="text-lg font-medium text-gray-800">
                                                {producto.nombre}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Cantidad: {cantidad} x{" "}
                                                {formatCurrency(
                                                    precioPagadoUnidad
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {/* Opcional: Mostrar descuento si el campo existe y es mayor que 0 */}
                                            {producto.pivot.descuento_aplicado >
                                                0 && (
                                                <p className="text-xs text-gray-500">
                                                    Dto:{" "}
                                                    {
                                                        producto.pivot
                                                            .descuento_aplicado
                                                    }
                                                    %
                                                </p>
                                            )}
                                            <p className="text-xl text-gray-800 font-bold">
                                                {formatCurrency(subtotal)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* TOTAL FINAL */}
                    <div className="flex justify-between items-center border-t border-gray-400 pt-4 mt-6">
                        <p className="text-2xl text-gray-700 font-bold">
                            TOTAL PAGADO
                        </p>
                        <p className="text-3xl text-red-600 font-extrabold">
                            {formatCurrency(totalFinal)}
                        </p>
                    </div>

                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                            Para cualquier consulta sobre este pedido (
                            <span className="font-medium">#{id_pedido}</span>),
                            por favor, contáctanos mencionando el ID.
                        </p>
                    </div>
                </div>
            </div>
        </Layout1>
    );
};

export default ConfirmacionPedido;
