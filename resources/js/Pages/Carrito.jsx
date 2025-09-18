import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Boton_go_back from '../components/Boton_go_back';
import Layout1 from '../layouts/Layout1';

const Carrito = () => {
    const { productos = [], total = 0 } = usePage().props;
    const [productosEnCarrito, setProductosEnCarrito] = useState(productos);
    const [totalCarrito, setTotalCarrito] = useState(total);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [isModalConfirmacionPedidoOpen, setIsModalConfirmacionPedidoOpen] = useState(false);
    const [mensaje, setMensaje] = useState('');

    // --- Modal eliminar producto ---
    const abrirModal = (productoId) => {
        setProductoAEliminar(productoId);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setProductoAEliminar(null);
        setIsModalOpen(false);
    };

  const eliminarProducto = async () => {
        if (!productoAEliminar) return;

        try {
            const response = await fetch(route('carrito.eliminar', productoAEliminar), {
                method: 'POST', // Cambiado a POST
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ _method: 'DELETE' }) // Simula DELETE metodo comun en Laravel ya qwue lso fomrularios no soportan DELETE directamente  
            });

            const data = await response.json();

            if (data.success) {
                const producto = productosEnCarrito.find(p => p.id === productoAEliminar);
                setProductosEnCarrito(prev =>
                    prev.filter(p => p.id !== productoAEliminar)
                );
                setTotalCarrito(prev => prev - (producto?.subtotal || 0));
                cerrarModal();

                setMensaje(`El producto "${data.nombreProducto}" ha sido eliminado del carrito.`);
                setTimeout(() => setMensaje(''), 4000);
            } else {
                alert(data.error || 'Error al eliminar el producto');
            }
        } catch (error) {
            console.error(error);
            alert('Error al eliminar el producto');
        }
    };

    // --- Modal confirmar pedido ---
    const abrirModalConfirmacionPedido = () => setIsModalConfirmacionPedidoOpen(true);
    const cerrarModalConfirmacionPedido = () => setIsModalConfirmacionPedidoOpen(false);

   const realizarPedidoHandler = async () => {
        try {
            const response = await fetch(route('crear.pedido'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json', // Muy importante para que acepte el json
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content, // Muy importante para enviar el token CSRF y evitar el error 419 que es lo que me ha apsado varias veces
                },
                credentials: 'same-origin', // <-- Muy importante para enviar la cookie de sesión
                body: JSON.stringify({
                    productos: productosEnCarrito,
                    total: totalCarrito,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setProductosEnCarrito([]);
                setTotalCarrito(0);
                cerrarModalConfirmacionPedido();

                setMensaje(data.mensaje);
                setTimeout(() => setMensaje(''), 4000);
            } else {
                alert(data.error || 'Error al crear el pedido');
            }
        } catch (error) {
            console.error(error);
            alert('Error al crear el pedido');
        }
    };

    return (
        <Layout1>
            {/* Toast */}
            {mensaje && (
                <div className="fixed top-5 right-5 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg shadow-lg animate-fade-in-down">
                    <strong className="font-semibold">✔ Éxito</strong>
                    <div className="text-sm">{mensaje}</div>
                </div>
            )}

            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
                <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto w-full">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tu Carrito</h2>

                    {productosEnCarrito.length === 0 ? (
                        <p className="text-gray-600 text-center">Tu carrito está vacío.</p>
                    ) : (
                        <div>
                            <ul className="divide-y divide-gray-200">
                                {productosEnCarrito.map((producto, index) => (
                                    <li key={index} className="py-4 flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-800">{producto.nombre}</h3>
                                            <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <p className="text-gray-800 font-medium">
                                                {new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio)} €
                                            </p>
                                            <p className="text-gray-500">Subtotal: {producto.subtotal} €</p>
                                            <button
                                                onClick={() => abrirModal(producto.id)}
                                                className="px-2 py-1 bg-red-500 text-white rounded"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 pt-4 border-t border-gray-300">
                                <p className="text-xl font-semibold text-gray-800">
                                    Total: <span className="text-red-500">
                                        {new Intl.NumberFormat('es-ES', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalCarrito)} €
                                    </span>
                                </p>
                            </div>

                            <div className="mt-6 text-center">
                                {productosEnCarrito.length > 0 && (
                                    <button
                                        onClick={abrirModalConfirmacionPedido}
                                        className="px-4 py-2 bg-green-500 text-white rounded"
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

            {/* Modal eliminar producto */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                            Confirmación de Eliminación
                        </h3>
                        <p className="text-lg text-gray-600 mb-4">
                            Estás por eliminar el producto de tu carrito. ¿Estás seguro?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cerrarModal}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={eliminarProducto}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal confirmar pedido */}
            {isModalConfirmacionPedidoOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                            Confirmación de Pedido
                        </h3>
                        <p className="text-lg text-gray-600 mb-4">
                            Estás a punto de realizar el pedido. ¿Deseas continuar?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cerrarModalConfirmacionPedido}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={realizarPedidoHandler}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout1>
    );
};

export default Carrito;
