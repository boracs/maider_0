import { usePage, router } from '@inertiajs/react';
import React from 'react';
import { toast } from 'react-toastify';
import { Inertia } from '@inertiajs/inertia';

const Producto = ({ nombre, precio, imagen, unidades, descuento, producto }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    
    // Verificar si el usuario tiene una taquilla asignada y distinta de 0 o null
    const tieneTaquilla = user && user.numeroTaquilla && user.numeroTaquilla !== 0 && user.numeroTaquilla !== null;

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
            <div 
                className="max-w-xs mx-auto bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer p-2"
                onClick={() => handleVerProducto(producto.id)}
            >
                <div className="w-full overflow-hidden">
                    <img 
                        src={`storage/productos/${imagen}`} 
                        alt={nombre} 
                        className="w-full h-40 object-cover"
                    />
                </div>
                <div className="p-2">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">{nombre}</h2>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-sm font-medium text-gray-600">{precio} €</p>
                        {descuento > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-red-500 font-semibold">{parseInt(descuento)}% OFF</p>
                                <p className="text-sm font-bold text-green-600">{parseFloat(precio - ((descuento / 100) * precio)).toFixed(2)} €</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-2">
                        {user ? (
                            tieneTaquilla ? (
                                // Si tiene taquilla válida
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
                                    {unidades === 0 ? 'Agotado' : 'Agregar al carrito'}
                                </button>
                            ) : (
                                // Si no tiene taquilla o la taquilla es 0 o null
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-3 py-1.5 text-white font-medium rounded-md bg-gray-400 cursor-not-allowed relative group"
                                    disabled
                                >
                                    Agregar al carrito
                                    <span className="absolute left-0 bottom-full mb-2 w-full text-center text-xs text-gray-700 bg-gray-200 rounded-md py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Debes tener una taquilla asignada para poder comprar ofertas
                                    </span>
                                </button>
                            )
                        ) : (
                            // Si el usuario no está logueado
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-1.5 text-white font-medium rounded-md bg-gray-400 cursor-not-allowed relative group"
                                disabled
                            >
                                Agregar al carrito
                                <span className="absolute left-0 bottom-full mb-2 w-full text-center text-xs text-gray-700 bg-gray-200 rounded-md py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Debes estar logueado para agregar productos al carrito
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Producto;
