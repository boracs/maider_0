import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react"; // 💡 Paso 1: Importar usePage
import Producto from "../components/Producto";
import Layout1 from "../layouts/Layout1";

const Tienda = ({ productos }) => {
    // 💡 Paso 2: Obtener los props de la página, incluyendo 'flash'
    const { props } = usePage();
    const { flash } = props;

    const productosPorPagina = 18;
    const [paginaActual, setPaginaActual] = useState(1); // 💡 Paso 3: Estado local para el mensaje de notificación (Toast)

    const [mensajeToast, setMensajeToast] = useState("");
    const [tipoToast, setTipoToast] = useState(""); // 'success' o 'error' // --- Lógica de ordenación y paginación ---

    const productosOrdenados = [...productos].sort((a, b) => {
        const nameA = a.nombre.toLowerCase();
        const nameB = b.nombre.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return a.id - b.id; // Orden secundario por id
    });

    const obtenerProductosDePagina = () => {
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        return productosOrdenados.slice(inicio, fin);
    };

    const totalPaginas = Math.ceil(productos.length / productosPorPagina);

    const irAAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const irASiguiente = () => {
        if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
    }; // 💡 Paso 4: EFECTO para manejar mensajes flash de Laravel

    useEffect(() => {
        // Muestra el mensaje de éxito
        if (flash && flash.success) {
            setMensajeToast(flash.success);
            setTipoToast("success");
            setTimeout(() => setMensajeToast(""), 4000);
        } // Muestra el mensaje de error (por si el servidor devuelve un error)
        if (flash && flash.error) {
            setMensajeToast(flash.error);
            setTipoToast("error");
            setTimeout(() => setMensajeToast(""), 4000);
        }
    }, [flash]); // Determinar las clases de Toast (igual que en Carrito)

    const toastClasses =
        tipoToast === "success"
            ? "bg-green-100 border border-green-400 text-green-800"
            : "bg-red-100 border border-red-400 text-red-800";
    const toastIcon = tipoToast === "success" ? "✔ Éxito" : "❌ Error";

    return (
        <Layout1>
            {/* 💡 Paso 5: Toast unificado para éxito o error */}{" "}
            {mensajeToast && (
                <div
                    className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg animate-fade-in-down ${toastClasses} z-50`}
                >
                    {" "}
                    <strong className="font-semibold">{toastIcon}</strong>
                    <div className="text-sm">{mensajeToast}</div>{" "}
                </div>
            )}{" "}
            <div className="p-4 w-[80%] mx-auto">
                {" "}
                <h2 className="text-2xl font-bold mb-4 text-center">Tienda</h2>
                {/* Mostrar productos */}{" "}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {" "}
                    {obtenerProductosDePagina().map((producto) => (
                        <Producto
                            key={producto.id}
                            nombre={producto.nombre}
                            precio={producto.precio}
                            imagenes={producto.imagenes}
                            unidades={producto.unidades}
                            descuento={producto.descuento}
                            producto={producto}
                        />
                    ))}{" "}
                </div>
                {/* Paginación */}{" "}
                <div className="flex justify-center mt-6 space-x-4">
                    {" "}
                    <button
                        onClick={irAAnterior}
                        className="px-4 py-2 bg-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={paginaActual === 1}
                    >
                        Anterior{" "}
                    </button>{" "}
                    <span className="text-sm text-gray-600">
                        Página {paginaActual} de {totalPaginas}{" "}
                    </span>{" "}
                    <button
                        onClick={irASiguiente}
                        className="px-4 py-2 bg-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={paginaActual === totalPaginas}
                    >
                        Siguiente{" "}
                    </button>{" "}
                </div>{" "}
            </div>{" "}
        </Layout1>
    );
};

export default Tienda;
