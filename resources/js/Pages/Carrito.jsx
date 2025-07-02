import React, { useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import Boton_go_back from '../components/Boton_go_back';
import Layout1 from '../layouts/Layout1';
import { Inertia } from '@inertiajs/inertia';

const Carrito = () => {
    const { productos = [], total = 0 } = usePage().props;
    const [productosEnCarrito, setProductosEnCarrito] = useState(productos);
    const [totalCarrito, setTotalCarrito] = useState(total);
    
    // Estado para mostrar el modal de confirmación de eliminación
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(null);

    // Estado para mostrar el modal de confirmación de pedido
    const [isModalConfirmacionPedidoOpen, setIsModalConfirmacionPedidoOpen] = useState(false);

    // Función para abrir el modal de eliminación
    const abrirModal = (productoId) => {
        setProductoAEliminar(productoId);
        setIsModalOpen(true);
    };

    // Función para cerrar el modal de eliminación
    const cerrarModal = () => {
        setIsModalOpen(false);
        setProductoAEliminar(null);
    };

    // Función para eliminar el producto
    const eliminarProducto = () => {
        if (productoAEliminar) {
            Inertia.post(route('carrito.eliminar', productoAEliminar), {
                _method: 'DELETE',
            }, {
                onSuccess: () => {
                    setProductosEnCarrito(prevProductos => 
                        prevProductos.filter(producto => producto.id !== productoAEliminar)
                    );
                    setTotalCarrito(prevTotal => 
                        prevTotal - productosEnCarrito.find(producto => producto.id === productoAEliminar)?.subtotal || 0
                    );
                    cerrarModal();
                },
                onError: (error) => {
                    console.error('Error al eliminar el producto:', error);
                    alert('Hubo un error al eliminar el producto.');
                },
            });
        }
    };

    // Función para abrir el modal de confirmación de pedido
    const abrirModalConfirmacionPedido = () => {
        setIsModalConfirmacionPedidoOpen(true);
    };

    // Función para cerrar el modal de confirmación de pedido
    const cerrarModalConfirmacionPedido = () => {
        setIsModalConfirmacionPedidoOpen(false);
    };

    // Función para realizar el pedido
    const realizarPedidoHandler = async () => {
        Inertia.post(route('crear.pedido'), { 
            productos: productosEnCarrito,
            total: totalCarrito,
        });
        cerrarModalConfirmacionPedido(); // Cerrar el modal tras realizar el pedido
    };

    return (
        <Layout1>
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
                                            
                                            {/* Botón para abrir el modal de eliminación */}
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
                                    Total: <span className="text-red-500">{new Intl.NumberFormat('es-ES', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalCarrito)} €</span>
                                </p>
                            </div>

                            {/* Botón para realizar el pedido */}
                            <div className="mt-6 text-center">
                                {productosEnCarrito.length > 0 ? (
                                    <button
                                        onClick={abrirModalConfirmacionPedido}
                                        className="px-4 py-2 bg-green-500 text-white rounded"
                                    >
                                        Realizar Pedido
                                    </button>
                                ) : (
                                    <p>Tu carrito está vacío.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botón para regresar */}
                    <div className="mt-6 text-center">
                        <Boton_go_back />
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                            Confirmación de Eliminación
                        </h3>
                        <p className="text-lg text-gray-600 mb-4">
                            Estás por eliminar el producto de tu carrito. ¿Estás seguro de que deseas continuar?
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

            {/* Modal de Confirmación de Pedido */}
            {isModalConfirmacionPedidoOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                            Confirmación de Pedido
                        </h3>
                        <p className="text-lg text-gray-600 mb-4">
                            Estás a punto de realizar el pedido. ¿Estás seguro de que deseas continuar?
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
