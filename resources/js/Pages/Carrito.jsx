import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import Boton_go_back from "../components/Boton_go_back";
import Layout1 from "../layouts/Layout1";

const Carrito = () => {
    // 1. Obtener los props y el objeto flash directamente de usePage()
    // Inertia se encarga de que estos props se actualicen automáticamente después de las visitas.
    const { props } = usePage();
    const { productos = [], total = 0, flash } = props;

    // Estado local para el mensaje de notificación (Toast)
    const [mensajeToast, setMensajeToast] = useState("");
    const [tipoToast, setTipoToast] = useState(""); // 'success' o 'error'

    // Estado para los modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [isModalConfirmacionPedidoOpen, setIsModalConfirmacionPedidoOpen] =
        useState(false);

    // --- EFECTO: Manejar mensajes flash de Laravel (incluye el mensaje de éxito de eliminar) ---
    useEffect(() => {
        // Muestra el mensaje de éxito enviado por el controlador
        if (flash.success) {
            setMensajeToast(flash.success);
            setTipoToast("success");
            setTimeout(() => setMensajeToast(""), 4000);
        }
        // Muestra el mensaje de error enviado por el controlador
        if (flash.error) {
            setMensajeToast(flash.error);
            setTipoToast("error");
            setTimeout(() => setMensajeToast(""), 4000);
        }
    }, [flash]); // Se ejecuta cada vez que el objeto flash cambia (después de una visita de Inertia)

    // --- Modal eliminar producto ---
    const abrirModal = (productoId) => {
        setProductoAEliminar(productoId);
        setIsModalOpen(true); // Abre el popup de verificación
    };

    const cerrarModal = () => {
        setProductoAEliminar(null);
        setIsModalOpen(false);
    };

    // --- Modal confirmar pedido ---
    const abrirModalConfirmacionPedido = () =>
        setIsModalConfirmacionPedidoOpen(true);
    const cerrarModalConfirmacionPedido = () =>
        setIsModalConfirmacionPedidoOpen(false);

    const eliminarProducto = () => {
        if (!productoAEliminar) return;

        // 💡 Usamos router.delete. El controlador de Laravel hará el Redirect::route('carrito')
        // Inertia recargará los props automáticamente (productos y total se actualizan)
        // y el useEffect capturará el mensaje flash de éxito.
        router.delete(route("carrito.eliminar", productoAEliminar), {
            preserveScroll: true,
            onFinish: () => {
                // Cierra el modal después de que la petición termine (éxito o fallo)
                cerrarModal();
            },
        });
    };

    const realizarPedidoHandler = () => {
        const totalNumerico = parseFloat(total.toString().replace(",", "."));

        if (isNaN(totalNumerico) || totalNumerico <= 0) {
            // ... (Mostrar error)
            return;
        }

        router.post(
            route("crear.pedido"),
            {
                productos: productos,
                total: totalNumerico,
            },
            {
                // 💡 ELIMINAMOS onSuccess:
                // La redirección del backend a 'pedido-confirmado'
                // ya se encarga de la navegación.

                // Mantener solo onError:
                onError: (errors) => {
                    // Manejar errores de validación (422) o errores de stock que
                    // el backend podría devolver antes de la redirección.
                    cerrarModalConfirmacionPedido();
                    setMensajeToast("Error de validación o del servidor.");
                    setTipoToast("error");
                    setTimeout(() => setMensajeToast(""), 4000);
                },
            }
        );
    };

    // Determinar las clases de Toast
    const toastClasses =
        tipoToast === "success"
            ? "bg-green-100 border border-green-400 text-green-800"
            : "bg-red-100 border border-red-400 text-red-800";
    const toastIcon = tipoToast === "success" ? "✔ Éxito" : "❌ Error";

    return (
        <Layout1>
            {/* Toast unificado para éxito o error */}
            {mensajeToast && (
                <div
                    className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg animate-fade-in-down ${toastClasses}`}
                >
                    <strong className="font-semibold">{toastIcon}</strong>
                    <div className="text-sm">{mensajeToast}</div>
                </div>
            )}

            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
                <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto w-full">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Tu Carrito
                    </h2>

                    {productos.length === 0 ? (
                        <p className="text-gray-600 text-center">
                            Tu carrito está vacío.
                        </p>
                    ) : (
                        <div>
                            <ul className="divide-y divide-gray-200">
                                {productos.map((producto, index) => (
                                    <li
                                        key={index}
                                        className="py-4 flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-800">
                                                {producto.nombre}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Cantidad: {producto.cantidad}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <p className="text-gray-800 font-medium">
                                                {new Intl.NumberFormat(
                                                    "es-ES",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                ).format(producto.precio)}{" "}
                                                €
                                            </p>
                                            <p className="text-gray-500">
                                                Subtotal: {producto.subtotal} €
                                            </p>
                                            <button
                                                onClick={() =>
                                                    // Llama al modal de verificación antes de eliminar
                                                    abrirModal(producto.id)
                                                }
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 pt-4 border-t border-gray-300">
                                <p className="text-xl font-semibold text-gray-800">
                                    Total:{" "}
                                    <span className="text-red-500">
                                        {new Intl.NumberFormat("es-ES", {
                                            style: "decimal",
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }).format(total)}{" "}
                                        €
                                    </span>
                                </p>
                            </div>

                            <div className="mt-6 text-center">
                                {productos.length > 0 && (
                                    <button
                                        onClick={abrirModalConfirmacionPedido}
                                        className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition duration-150 shadow-md"
                                    >
                                        Realizar Pedido
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Boton_go_back />
                    </div>
                </div>
            </div>

            {/* Modal eliminar producto (Popup de verificación) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
                        <h3 className="text-2xl font-bold text-red-600 mb-4">
                            ⚠️ Confirmar Eliminación
                        </h3>
                        <p className="text-lg text-gray-700 mb-6">
                            Estás a punto de eliminar un producto de tu carrito.
                            ¿Estás realmente seguro?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cerrarModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-150 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={eliminarProducto} // Solo si confirma, llama a la función de eliminación
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 font-bold"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal confirmar pedido */}
            {isModalConfirmacionPedidoOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
                        <h3 className="text-2xl font-bold text-green-600 mb-4">
                            🛒 Confirmación de Pedido
                        </h3>
                        <p className="text-lg text-gray-700 mb-6">
                            Estás a punto de **confirmar tu pedido** por un
                            total de **
                            {new Intl.NumberFormat("es-ES", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }).format(total)}{" "}
                            €**. ¿Deseas continuar?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cerrarModalConfirmacionPedido}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-150 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={realizarPedidoHandler}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150 font-bold"
                            >
                                Confirmar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout1>
    );
};

export default Carrito;
