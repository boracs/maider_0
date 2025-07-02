import React from 'react';
import { usePage } from '@inertiajs/react';
import Layout1 from '../layouts/Layout1';

const ProductoEliminado = () => {
    const { nombreProducto } = usePage().props; // Obtener el nombre del producto desde los props

    return (
        <Layout1>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                <div className="p-8 bg-white rounded-lg shadow-xl max-w-lg mx-auto w-full">
                    <h2 className="text-3xl font-semibold text-green-600 mb-6">
                        ¡Producto Eliminado Exitosamente!
                    </h2>
                    <p className="text-lg text-gray-700 mb-6">
                        El producto <strong>{nombreProducto}</strong> ha sido eliminado con éxito.
                    </p>

                    <div className="mt-6 text-center">
                        <a
                            href="/tienda"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition duration-200"
                        >
                            Volver a la lista de productos
                        </a>
                    </div>
                </div>
            </div>
        </Layout1>
    );
};

export default ProductoEliminado;