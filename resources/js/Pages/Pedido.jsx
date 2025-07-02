import React from 'react';
import { usePage } from '@inertiajs/react';
import Layout1 from '../layouts/Layout1';

const ConfirmacionPedido = () => {
    const { productos, totalConDescuento, id_pedido } = usePage().props; // Incluye el id_pedido en los props

    return (
        <Layout1>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
                <div className="max-w-4xl w-full bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Confirmación de Pedido</h2>
                    
                    <div className="mb-6">
                        <p className="text-xl text-gray-700 mb-2">¡Gracias por tu compra! Tu pedido ha sido recibido con éxito.</p>
                        <p className="text-lg text-gray-600">Aquí están los detalles de tu pedido:</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Productos en tu Pedido</h3>
                        <ul className="space-y-4">
                            {productos.map((producto, index) => {
                                const precioConDescuento = producto.precio - (producto.precio * (producto.descuento / 100));
                                const precioTotalProducto = precioConDescuento * producto.pivot.cantidad;
                                
                                return (
                                    <li key={index} className="flex justify-between items-center border-b border-gray-300 py-3">
                                        <div className="flex flex-col">
                                            <p className="text-lg font-medium text-gray-800">{producto.nombre}</p>
                                            <p className="text-sm text-gray-600">Cantidad: {producto.pivot.cantidad}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 line-through">
                                                {(producto.precio * producto.pivot.cantidad).toFixed(2)} €
                                            </p>
                                            <p className="text-lg text-gray-800 font-semibold">
                                                {new Intl.NumberFormat('es-ES', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precioConDescuento)} € / Unidad
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-300 pt-4">
                        <p className="text-xl text-gray-700 font-semibold">Total con Descuento</p>
                        <p className="text-xl text-red-500 font-semibold">
                            {new Intl.NumberFormat('es-ES', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalConDescuento)} €
                        </p>
                    </div>
                    <div>
                        <p>
                            Si tiene algun duda o quieres cancelar un pedido no te preocupes, solo tienes que avisarnos. 
                        </p>
                    </div>
                </div>
            </div>
        </Layout1>
    );
};

export default ConfirmacionPedido;
