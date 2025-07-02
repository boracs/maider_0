import { usePage, router } from '@inertiajs/react';
import React from 'react';
import { toast } from 'react-toastify';
import { Inertia } from '@inertiajs/inertia'; 

const ProductoOferta = ({ nombre, precio, imagen, unidades, descuento, producto }) => {
    const { auth } = usePage().props;
    const user = auth?.user;

    // Verificar si el usuario tiene una taquilla asignada
    const numeroTaquilla = user?.numeroTaquilla || 0; // Si no tiene taquilla, será 0

    const handleAgregarAlCarrito = (productoId) => {
        router.post(
            route('carrito.agregar', productoId),
            {},
            {
                onSuccess: (response) => {
                    if (response.props.carrito) {
                        setCarrito(response.props.carrito);
                    }
                    toast.success('Producto agregado al carrito');
                },
                onError: () => {
                    toast.error('Hubo un problema al agregar el producto al carrito');
                },
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleVerProducto = (productoId) => {
        Inertia.visit(route('producto.ver', { productoId }));
    };

    return (
        <div>
            <div className="mt-16 flex justify-center items-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-4 rounded-lg shadow-md w-full max-w-sm mx-auto">
                <h1 className="text-white text-xl font-semibold text-center uppercase tracking-normal">
                    Mejores Ofertas
                </h1>
            </div>

            <div
                className="max-w-xs mx-auto bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer p-2"
                onClick={() => handleVerProducto(producto.id)}
            >
                <div className="w-full overflow-hidden">
                    <img
                        src={`storage/productos/${imagen}`}
                        alt={nombre}
                        className="w-full h-40 object-cover" // Imagen más pequeña
                    />
                </div>
                <div className="p-2">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">{nombre}</h2>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-sm font-medium text-gray-600">{precio} €</p>
                        {descuento > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-red-500 font-semibold">{parseInt(descuento)}% OFF</p>
                                <p className="text-sm font-bold text-green-600">
                                    {parseFloat(precio - (descuento / 100) * precio).toFixed(2)} €
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mt-2">
                        {user && numeroTaquilla > 0 ? (
                            // Usuario con taquilla válida
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAgregarAlCarrito(producto.id);
                                }}
                                className={`w-full px-3 py-1.5 text-white font-medium rounded-md transition-colors duration-300 ${
                                    unidades === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                                disabled={unidades === 0}
                            >
                                {unidades === 0 ? 'Producto agotado' : 'Agregar al carrito'}
                            </button>
                        ) : (
                            // Usuario sin taquilla o no logueado
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-1.5 text-white font-medium rounded-md bg-gray-400 cursor-not-allowed relative group"
                                disabled
                            >
                                Agregar al carrito
                                <span className="absolute left-0 bottom-full mb-2 w-full text-center text-xs text-gray-700 bg-gray-200 rounded-md py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Debes poseer una taquilla para comprar ofertas
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductoOferta;
