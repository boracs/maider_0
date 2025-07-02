import React from 'react';
import { usePage, router } from '@inertiajs/react'; 
import Layout1 from '../layouts/Layout1';
import { toast } from 'react-toastify'; // Asegúrate de importar toast

const ProductVer = ({ producto, usuario }) => {
    const { auth } = usePage().props;
    const usuarioActual = usuario || auth?.user || null;

    if (!producto) {
        return (
            <Layout1>
                <div className="flex justify-center items-center h-screen">
                    <p className="text-xl">Cargando producto...</p>
                </div>
            </Layout1>
        );
    }

    const numeroTaquilla = usuarioActual?.numeroTaquilla || 0;

    console.log(numeroTaquilla);

    // Formatear precios con Intl.NumberFormat
    const formatoPrecio = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    });

    // Calcular precio final con descuento
    const precioFinal =
        producto.descuento > 0
            ? producto.precio - (producto.precio * producto.descuento) / 100
            : producto.precio;

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

    return (
        <Layout1>
            <div className="container mx-auto py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Imagen del producto */}
                    <div className="flex justify-center">
                        <img
                            src={`/storage/productos/${producto.imagen}`} // Ajusta la ruta según tu sistema
                            alt={producto.nombre}
                            className="max-w-full h-auto rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Información del producto */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            {producto.nombre}
                        </h1>

                        {producto.descuento > 0 ? (
                            <div className="text-2xl font-semibold text-green-500 mb-4">
                                <span className="line-through text-gray-500 text-lg md:text-xl mr-2">
                                    {formatoPrecio.format(producto.precio)}
                                </span>
                                <span>{formatoPrecio.format(precioFinal)}</span>
                            </div>
                        ) : (
                            <div className="text-2xl font-semibold text-green-500 mb-4">
                                {formatoPrecio.format(producto.precio)}
                            </div>
                        )}

                        {producto.descuento > 0 && (
                            <div className="flex items-center mb-6">
                                <span className="text-gray-600 text-lg md:text-xl">
                                    Descuento:
                                </span>
                                <span className="text-red-600 text-lg md:text-xl ml-2">
                                    {parseInt(producto.descuento)}%
                                </span>
                            </div>
                        )}

                        {/* Mostrar unidades solo si quedan menos de 3 */}
                        {producto.unidades <= 3 && (
                            <div className="flex items-center mb-6">
                                <span className="text-red-600 text-lg md:text-xl font-bold">
                                    {producto.unidades === 0 ? 'Producto agotado' : `Solo quedan ${producto.unidades} unidad${producto.unidades > 1 ? 'es' : ''}`}
                                </span>
                            </div>
                        )}

                        {/* Condición para usuarios sin taquilla */}
                        {numeroTaquilla === 0 || numeroTaquilla === null ? (
                            <>
                                <button
                                    className="w-full px-4 py-2 bg-gray-400 text-white font-medium rounded-md cursor-not-allowed"
                                    disabled
                                    title="Debes tener una taquilla para poder comprar"
                                >
                                    No puedes comprar
                                </button>
                                <p className="text-red-600 text-sm mt-4">
                                    Lo siento, debes tener una taquilla asignada y estar registrado para disponer de la oferta.
                                </p>
                            </>
                        ) : (
                            <button
                                onClick={() => handleAgregarAlCarrito(producto.id)}
                                disabled={producto.unidades === 0}
                                className={`w-full px-4 py-2 ${producto.unidades === 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md`}
                                title={numeroTaquilla === 0 || numeroTaquilla === null ? "Debes ser poseedor de una taquilla para poder comprar en oferta" : ""}
                            >
                                {producto.unidades === 0 ? 'Agotado' : 'Añadir al carrito'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Layout1>
    );
};

export default ProductVer;
