import React from 'react';
import { Head } from '@inertiajs/react';
import Layout1 from '../layouts/Layout1';

const ConfirmacionPedido = ({ mensaje, pedido, productos }) => {
    return (
        <Layout1>
            <div className="min-h-screen bg-gradient-to-r from-teal-100 to-teal-200 flex items-center justify-center py-10">
                <div className="p-8 bg-white rounded-xl shadow-lg max-w-3xl mx-auto w-full">
                    <Head title="Confirmación de Pedido" />
                    <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">{mensaje}</h2>

                    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
                        <p className="text-lg text-gray-600">
                            <span className="font-semibold">Pedido ID:</span> <strong>{pedido.id}</strong>
                        </p>
                        <p className="text-lg text-gray-600 mt-2">
                            <span className="font-semibold">Total:</span> <strong>{pedido.precio_total} €</strong>
                        </p>
                    </div>

                    <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Productos en tu Pedido:</h3>

                    <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md">
                        <table className="min-w-full bg-white">
                            <thead className="bg-teal-600 text-white">
                                <tr>
                                    <th className="py-3 px-6 text-left">Producto</th>
                                    <th className="py-3 px-6 text-left">Precio Unitario</th>
                                    <th className="py-3 px-6 text-center">Cantidad</th>
                                    <th className="py-3 px-6 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos && productos.map((producto) => (
                                    <tr key={producto.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-6 text-left flex items-center">
                                            {producto.imagen && <img src={producto.imagen} alt={producto.nombre} className="w-10 h-10 mr-4 rounded-md" />}
                                            <span className="text-gray-700">{producto.nombre}</span>
                                        </td>
                                        <td className="py-4 px-6 text-left text-gray-600">{producto.precio} €</td>
                                        <td className="py-4 px-6 text-center text-gray-600">{producto.pivot.cantidad}</td>
                                        <td className="py-4 px-6 text-right text-gray-800 font-semibold">{(producto.precio * producto.pivot.cantidad).toFixed(2)} €</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 text-center">
                        <button className="bg-teal-600 text-white py-2 px-6 rounded-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50">
                            Volver a la tienda
                        </button>
                    </div>
                </div>
            </div>
        </Layout1>
    );
};

export default ConfirmacionPedido;
