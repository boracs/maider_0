import Layout1 from "../layouts/Layout1";
import { Link, router } from "@inertiajs/react";
import React, { useRef, useState, useEffect } from "react";

export default function Productos({ productos: productosIniciales }) {   //  Renombramos la prop 'productos' que viene del backend como 'productosIniciales' Esto evita conflictos de nombres con el estado interno que vamos a crear.
    const [productos, setProductos] = useState(productosIniciales);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const contenedorDerechoRef = useRef(null);
    const [formData, setFormData] = useState({
        nombre: "",
        precio: "",
        unidades: "",
        descuento: "",
        imagenes: [],
        imagenes_ids: [],
    });

    // resto de tu código


    // Luego, cuando productoSeleccionado exista:
        useEffect(() => {
  if (productos.length > 0 && !productoSeleccionado) {
    const p = productos[0];
    setProductoSeleccionado(p);
    setFormData({
      nombre: p.nombre,
      precio: p.precio,
      unidades: p.unidades,
      descuento: p.descuento,
      imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
    });
  }
}, [productos, productoSeleccionado]);




    //cargo el modal de la derecha o lo acutalzioa al clicar en unn producto
        const handleProductoClick = async (producto) => {
            setProductoSeleccionado(producto);

            try {
                const res = await fetch(`/productos/${producto.id}/imagenes`);
                const data = await res.json();

                const imagenPrincipal = data.imagenes[0]?.url || null;
                const imagenesSecundarias = data.imagenes.slice(1).map(i => i.url);

                setFormData({
                    nombre: producto.nombre,
                    precio: producto.precio,
                    unidades: producto.unidades,
                    descuento: producto.descuento,
                    imagenes: imagenPrincipal ? [imagenPrincipal, ...imagenesSecundarias] : imagenesSecundarias,
                    imagenes_ids: data.imagenes.map(i => i.id), // para el doble click
                });
            } catch (error) {
                console.error('Error cargando imágenes:', error);
            }
        };


const handleDoubleClick = async (img, idx) => {
    if (!productoSeleccionado) return;

    try {
        await fetch(`/productos/${productoSeleccionado.id}/imagen-principal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({ imagen_id: formData.imagenes_ids[idx] }),
        });

        // 1. Actualizamos el modal
        const nuevasImagenes = [
            img,
            ...formData.imagenes.filter((_, iIdx) => iIdx !== idx),
        ];
        setFormData(prev => ({
            ...prev,
            imagenes: nuevasImagenes,
        }));

        // 2. Actualizamos el listado de productos (la izquierda)
        setProductos(prev =>
            prev.map(p =>
                p.id === productoSeleccionado.id
                    ? { ...p, imagen_principal: img } // 👈 aquí reemplazamos el src
                    : p
            )
        );
    } catch (error) {
        console.error('Error actualizando la imagen principal', error);
    }
};


    // Maneja el cambio en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };




    // Función para manejar el cambio de imagen
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            imagenes: files,
        }));
    };

    const handleEliminar = () => {
        if (!productoSeleccionado) return;

        router.put(
            route("producto.eliminar", { id: productoSeleccionado.id }),
            {},
            {
                onSuccess: () => {
                    // ⚡ Actualizamos el estado local para reflejar el cambio al instante
                    setProductoSeleccionado((prev) => ({
                        ...prev,
                        eliminado: prev.eliminado ? 0 : 1, // si estaba 1 (eliminado) pasa a 0 y viceversa
                    }));
                },
                onError: (errors) => {
                    console.error(
                        "Error al cambiar el estado del producto:",
                        errors
                    );
                },
            }
        );// ⚡ Ahora actualizamos la lista de productos
            setProductos(prev =>
                prev.map(p =>
                    p.id === productoSeleccionado.id
                        ? { ...p, eliminado: productoSeleccionado.eliminado ? 0 : 1 }
                        : p
                )
            );
    };
    // Función para manejar la modificación del producto
   const handleModificar = async (event) => {
    event.preventDefault();

    // 1️⃣ Validar que se haya seleccionado un producto
    if (!productoSeleccionado) {
        alert("Selecciona un producto para modificar.");
        return;
    }

    // 2️⃣ Validar campos obligatorios
    if (!formData.nombre || !formData.precio || !formData.unidades) {
        alert("Por favor, rellena todos los campos requeridos.");
        return;
    }

    // 3️⃣ Crear FormData para enviar datos al backend
    const formDataToSend = new FormData();
    formDataToSend.append("nombre", formData.nombre);
    formDataToSend.append("precio", formData.precio);
    formDataToSend.append("unidades", formData.unidades);
    formDataToSend.append("descuento", formData.descuento || 0); // Descuento opcional

    // 4️⃣ Añadir todas las imágenes seleccionadas
    if (formData.imagenes && formData.imagenes.length > 0) {
        formData.imagenes.forEach((file) => {
            formDataToSend.append("imagenes[]", file); // Importante usar 'imagenes[]'
        });
    } else {
        console.log("No se han seleccionado imágenes nuevas.");
    }

    // 5️⃣ Depuración: revisar los datos que se enviarán
    for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
    }

    // 6️⃣ Enviar los datos al backend usando Inertia
    router.post(
        route("producto.edit", { id: productoSeleccionado.id }),
        formDataToSend,
        {
            onSuccess: () => {
                console.log("Producto actualizado correctamente");
                // Aquí podrías refrescar la lista de productos si quieres
            },
            onError: (errors) => {
                console.error("Error actualizando producto:", errors);
            }
        }
    );

    // 7️⃣ Scroll al contenedor derecho para mantener el foco en el producto
    if (contenedorDerechoRef.current) {
        contenedorDerechoRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
        });
    }
};




    return (
        <Layout1>
            <div className="flex flex-col lg:flex-row p-4 space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 lg:w-full overflow-auto p-3 border rounded-lg shadow-sm bg-white">
                    <h2 className="text-xl font-semibold mb-3">Productos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {productos
                            .sort((a, b) => a.nombre.localeCompare(b.nombre))
                            .map((producto) => (
                                <div
                                    key={producto.id}
                                    className={`flex flex-col items-center p-3 border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 ${
                                        producto.unidades < 5
                                            ? "bg-red-200"
                                            : ""
                                    } max-w-[200px] relative`}
                                    onClick={() =>
                                        handleProductoClick(producto)
                                    }
                                >
                                    {/* Capa de oscuridad aplicada si el producto está seleccionado */}
                                    {productoSeleccionado &&
                                        productoSeleccionado.id ===
                                            producto.id && (
                                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
                                        )}

                                    {producto.eliminado === 1 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg"></div>
                                    )}

                                    
                                   <img
                                        src={productos.find(p => p.id === producto.id)?.imagen_principal || "/img/placeholder.jpg"}
                                        alt={producto.nombre}
                                        className={`w-24 h-24 object-cover rounded-lg mb-2 ${producto.eliminado === 1 ? "opacity-50" : ""}`}
                                    />

                                    <p className="text-center text-sm font-medium text-blue-600">
                                        {producto.nombre}
                                    </p>
                                    <div className="text-center text-sm text-gray-600">
                                        <p>
                                            Cantidad:{" "}
                                            <span className="font-semibold">
                                                {producto.unidades}
                                            </span>
                                        </p>
                                        <p>
                                            Precio:{" "}
                                            <span className="font-semibold text-green-600">
                                                ${producto.precio}
                                            </span>
                                        </p>
                                        {producto.descuento > 0 && (
                                            <p>
                                                Descuento:{" "}
                                                <span className="font-semibold text-red-600">
                                                    {producto.descuento}%
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="flex justify-center mt-12 bg-black bg-opacity-10 items-center py-6">
                        <button
                            type="button"
                            className="w-200 py-2 px-12 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700"
                            onClick={() =>
                                router.visit(route("producto.crear"))
                            }
                        >
                            Crear Producto
                        </button>
                    </div>
                </div>

                {productoSeleccionado && (
                    <div
                        className="sticky top-4 lg:w-[250px] max-h-[80vh] overflow-y-auto p-4 border rounded-lg shadow-sm bg-white"
                        ref={contenedorDerechoRef}
                    >
                        <h3 className="text-xl font-semibold mb-3">
                            Opciones para: {productoSeleccionado.nombre}
                        </h3>
                        <div className="mb-4">
                            {/* Imagen principal + miniaturas con scroll (usa formData.imagenes) */}
                            {Array.isArray(formData.imagenes) &&
                                formData.imagenes.length > 0 && (
                                    <div className="mb-4">
                                        {/* Imagen principal + miniaturas con scroll (usa formData.imagenes) */}
                                        {Array.isArray(formData.imagenes) &&
                                            formData.imagenes.length > 0 && (
                                                <div className="mb-4">
                                                    {/* Imagen principal */}
                                                    <div className="flex justify-center mb-2">
                                                        <img
                                                            src={
                                                                formData
                                                                    .imagenes[0] instanceof
                                                                File
                                                                    ? URL.createObjectURL(
                                                                          formData
                                                                              .imagenes[0]
                                                                      )
                                                                    : formData
                                                                          .imagenes[0]
                                                            }
                                                            alt={
                                                                productoSeleccionado.nombre
                                                            }
                                                            className="w-48 h-48 object-cover rounded-lg shadow-sm"
                                                        />
                                                    </div>

                                                   {/* Miniaturas con scroll horizontal */}
                                                {formData.imagenes.length > 1 && (
                                                <div className="flex overflow-x-auto space-x-2 max-w-full p-1 rounded-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                                    {formData.imagenes.slice(1).map((img, index) => (
                                                    <img
                                                        key={index}
                                                        src={img instanceof File ? URL.createObjectURL(img) : img}
                                                        alt={`${productoSeleccionado.nombre} ${index + 2}`}
                                                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 flex-shrink-0"
                                                        // Click normal: solo seleccionar la miniatura
                                                        // Doble click: cambiar la imagen principal en la DB
                                                        onDoubleClick={() => handleDoubleClick(img, index + 1)}
                                                    />
                                                    ))}
                                                </div>
                                                )}
                                                </div>
                                            )}
                                    </div>
                                )}
                        </div>

                        <div className="space-y-4">
                            <button
                                className={`w-full py-2 px-4 ${
                                    productoSeleccionado.eliminado
                                        ? "bg-green-600"
                                        : "bg-red-600"
                                } text-white font-semibold rounded-lg shadow-sm hover:${
                                    productoSeleccionado.eliminado
                                        ? "bg-green-700"
                                        : "bg-red-700"
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    productoSeleccionado.eliminado
                                        ? "focus:ring-green-500"
                                        : "focus:ring-red-500"
                                }`}
                                onClick={handleEliminar}
                            >
                                {productoSeleccionado.eliminado
                                    ? "Activar Producto"
                                    : "Desactivar Producto"}
                            </button>

                            <div className="mt-4">
                                <h4 className="text-lg font-semibold mb-3">
                                    Modificar Producto
                                </h4>
                                <form
                                    className="space-y-3"
                                    method="POST"
                                    encType="multipart/form-data"
                                    onSubmit={handleModificar}
                                >
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">
                                            Imagen
                                        </label>
                                        <div
                                            className="mt-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "image-input"
                                                    )
                                                    .click()
                                            }
                                        >
                                            <span className="text-sm text-gray-600">
                                                Haz clic para seleccionar
                                                imágenes
                                            </span>
                                            <input
                                                type="file"
                                                name="imagenes"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                id="image-input"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">
                                            Precio
                                        </label>
                                        <input
                                            type="number"
                                            name="precio"
                                            value={formData.precio}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">
                                            Unidades
                                        </label>
                                        <input
                                            type="number"
                                            name="unidades"
                                            value={formData.unidades}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">
                                            Descuento (%)
                                        </label>
                                        <input
                                            type="number"
                                            name="descuento"
                                            value={formData.descuento}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout1>
    );
}
