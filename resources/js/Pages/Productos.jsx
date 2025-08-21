import Layout1 from "../layouts/Layout1";
import { Link, router } from "@inertiajs/react";
import React, { useRef, useState, useEffect } from "react";

export default function Productos({ productos }) {
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const contenedorDerechoRef = useRef(null);
    const [formData, setFormData] = useState({
        nombre: "",
        precio: "",
        unidades: "",
        descuento: "",
        imagenPrincipal: productoSeleccionado?.imagen || null,
        imagenesSecundarias: [],
    });

    // Luego, cuando productoSeleccionado exista:
    useEffect(() => {
        if (productoSeleccionado) {
            setFormData((prev) => ({
                ...prev,
                imagenPrincipal: productoSeleccionado.imagen || null,
            }));
        }
    }, [productoSeleccionado]);

    //cargo el modal de la derecha o lo acutalzioa al clicar en unn producto
    const handleProductoClick = (producto) => {
        setProductoSeleccionado(producto);

        // Imagen principal
        const imagenPrincipal = producto.imagen_principal?.ruta
            ? `/storage/${producto.imagen_principal.ruta}`
            : null;

        // Imágenes secundarias
        const imagenesSecundarias = producto.imagenes_secundarias?.length
            ? producto.imagenes_secundarias.map((img) => `/storage/${img.ruta}`)
            : [];

        setFormData({
            nombre: producto.nombre,
            precio: producto.precio,
            unidades: producto.unidades,
            descuento: producto.descuento,
            imagenes: [imagenPrincipal, ...imagenesSecundarias].filter(Boolean), // Aquí combinas todo
        });
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
        );
    };

    // Función para manejar la modificación del producto
    const handleModificar = async (event) => {
        event.preventDefault();

        // Validar que se haya seleccionado un producto
        if (!productoSeleccionado) {
            alert("Selecciona un producto para modificar.");
            return;
        }

        // Validar campos obligatorios
        if (!formData.nombre || !formData.precio || !formData.unidades) {
            alert("Por favor, rellena todos los campos requeridos.");
            return;
        }

        // Crear FormData para enviar datos
        const formDataToSend = new FormData();
        formDataToSend.append("nombre", formData.nombre);
        formDataToSend.append("precio", formData.precio);
        formDataToSend.append("unidades", formData.unidades);
        formDataToSend.append("descuento", formData.descuento || 0); // Descuento opcional

        // Verificar que formData.imagen no sea null y que sea un archivo válido
        if (formData.imagen && formData.imagen instanceof File) {
            formDataToSend.append("imagen", formData.imagen); // Añadir imagen
        } else {
            console.log("No se ha seleccionado ninguna imagen.");
        }

        // Depuración para ver todos los valores añadidos a FormData
        for (let [key, value] of formDataToSend.entries()) {
            console.log(key, value); // Imprimir cada par clave-valor
        }

        // Enviar datos al backend usando Inertia con el método POST

        router.post(
            route("producto.edit", { id: productoSeleccionado.id }),
            formDataToSend,
            {}
        );

        // Referencia al contenedor derecho

        if (contenedorDerechoRef.current) {
            contenedorDerechoRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start", // Ajusta para que quede visible al inicio
                inline: "nearest", // Ajusta para que quede visible al inicio
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
                                        src={
                                            producto.imagen_principal?.ruta
                                                ? `/storage/${producto.imagen_principal.ruta}`
                                                : ""
                                        }
                                        alt={producto.nombre}
                                        className={`w-24 h-24 object-cover rounded-lg mb-2 ${
                                            producto.eliminado === 1
                                                ? "opacity-50"
                                                : ""
                                        }`}
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
                           {/* Imagen principal */}
{formData.imagenes && formData.imagenes.length > 0 && (
  <div className="flex flex-col items-center mb-4">
    <img
      src={
        formData.imagenes[0] instanceof File
          ? URL.createObjectURL(formData.imagenes[0])
          : formData.imagenes[0]
      }
      alt={productoSeleccionado.nombre}
      className="w-48 h-48 object-cover rounded-lg shadow-sm mb-2"
    />

    {/* Miniaturas secundarias */}
    <div className="flex space-x-2">
      {formData.imagenes.slice(1).map((img, index) => (
        <img
          key={index}
          src={img instanceof File ? URL.createObjectURL(img) : img}
          alt={`${productoSeleccionado.nombre} ${index + 2}`}
          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
          onClick={() => {
            // Cambiar imagen principal al hacer click
            const nuevasImagenes = [...formData.imagenes];
            [nuevasImagenes[0], nuevasImagenes[index + 1]] = [
              nuevasImagenes[index + 1],
              nuevasImagenes[0],
            ];
            setFormData({ ...formData, imagenes: nuevasImagenes });
          }}
        />
      ))}
    </div>
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
