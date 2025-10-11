import { usePage, router } from "@inertiajs/react";
import React from "react";
import { toast } from "react-toastify";

const Producto = ({
    nombre,
    precio,
    imagenes,
    unidades,
    descuento,
    producto,
}) => {
    const { auth } = usePage().props;
    const user = auth?.user;

    // Verificar si el usuario tiene una taquilla asignada y distinta de 0 o null
    const tieneTaquilla =
        user &&
        user.numeroTaquilla &&
        user.numeroTaquilla !== 0 &&
        user.numeroTaquilla !== null;

    // Lógica para manejar la adición al carrito
    const handleAgregarAlCarrito = (productoId) => {
        router.post(
            route("carrito.agregar", productoId),
            {},
            {
                onSuccess: () => toast.success("Producto agregado al carrito"),
                onError: () =>
                    toast.error(
                        "Hubo un problema al agregar el producto al carrito"
                    ),
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Lógica para manejar la navegación a la vista del producto
    const handleVerProducto = (productoId) => {
        router.get(
            route("producto.ver", { productoId }),
            {},
            {
                preserveState: false,
                preserveScroll: true,
            }
        );
    };

    // Lógica para determinar la fuente de la imagen.
    // Usamos una comprobación más robusta para asegurar que la imagenPrincipal es una cadena válida
    // y no contiene la subcadena 'undefined' que causaba el error 403.
    const imageSource =
        producto.imagenPrincipal &&
        typeof producto.imagenPrincipal === "string" &&
        !producto.imagenPrincipal.includes("undefined")
            ? `/storage/${producto.imagenPrincipal}`
            : "/img/placeholder.jpg";

    return (
        <div>
            <div
                className="max-w-xs mx-auto bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer p-2"
                onClick={() => handleVerProducto(producto.id)}
            >
                <div className="w-full overflow-hidden">
                    <img
                        src={imageSource} // Usando la fuente de imagen defensiva
                        alt={producto.nombre}
                        className="w-full h-40 object-cover cursor-pointer"
                    />
                </div>
                <div className="p-2">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                        {nombre}
                    </h2>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-sm font-medium text-gray-600">
                            {precio} €
                        </p>
                        {descuento > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-red-500 font-semibold">
                                    {parseInt(descuento)}% OFF
                                </p>
                                <p className="text-sm font-bold text-green-600">
                                    {(
                                        precio -
                                        (descuento / 100) * precio
                                    ).toFixed(2)}{" "}
                                    €
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-2">
                        {user ? (
                            tieneTaquilla ? (
                                /* 🏆 1. ESTADO HABILITADO (Logueado y con Taquilla) 🏆 */
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAgregarAlCarrito(producto.id);
                                    }}
                                    disabled={unidades === 0}
                                    className={`
                    w-full py-2.5 rounded-lg font-bold transition-all duration-200 shadow-md text-white
                    
                    ${
                        unidades === 0
                            ? "bg-gray-400 cursor-not-allowed shadow-none" // AGOTADO
                            : // 💡 CAMBIO DE COLOR: Gris Pizarra (Slate) más profesional y tranquilo
                              "bg-slate-600 hover:bg-slate-700 focus:ring-4 focus:ring-slate-300 shadow-slate-400/50"
                    }
                    
                    ${
                        unidades > 0
                            ? "transform active:scale-[0.96] active:shadow-sm" // EFECTO CHULO AL CLICAR
                            : ""
                    }
                `}
                                >
                                    {unidades === 0
                                        ? "AGOTADO"
                                        : "Añadir al Carrito"}
                                </button>
                            ) : (
                                /* ⚠️ 2. ESTADO DESHABILITADO (Logueado pero sin Taquilla) ⚠️ */
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    // Mantener el color neutro para la advertencia
                                    className="w-full py-2.5 rounded-lg font-bold bg-slate-500 text-white cursor-not-allowed relative group shadow-md"
                                    disabled
                                >
                                    <span className="opacity-75">
                                        Taquilla Requerida
                                    </span>
                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] w-max max-w-xs text-center text-xs text-gray-700 bg-gray-100 rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                                        Debes tener una taquilla asignada para
                                        poder comprar ofertas
                                    </span>
                                </button>
                            )
                        ) : (
                            /* 🚫 3. ESTADO DESHABILITADO (No Logueado) 🚫 */
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-full py-2.5 rounded-lg font-bold bg-gray-400 text-gray-700 cursor-not-allowed relative group shadow-md"
                                disabled
                            >
                                <span className="opacity-75">
                                    Iniciar Sesión
                                </span>
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] w-max max-w-xs text-center text-xs text-gray-700 bg-gray-100 rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                                    Debes estar logueado para agregar productos
                                    al carrito
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
