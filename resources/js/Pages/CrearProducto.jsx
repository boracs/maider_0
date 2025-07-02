import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import Layout1 from '../layouts/Layout1';





const CrearProducto = () => {
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    unidades: '',
    imagen: null,
    descuento: '',
    eliminado: false
  });

  // Función para manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Función para manejar el cambio de la imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      imagen: file
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Crear un objeto FormData para manejar el archivo
    const form = new FormData();
    form.append('nombre', formData.nombre);
    form.append('precio', formData.precio);
    form.append('unidades', formData.unidades);
    form.append('imagen', formData.imagen); // Aquí se maneja la imagen
    form.append('descuento', formData.descuento);
    form.append('eliminado', formData.eliminado);

    // Enviar los datos al backend utilizando Inertia.js
    Inertia.post('producto-store', form, { // Asegúrate que '/producto/create' es la ruta correcta
      onSuccess: () => {
        // Redirigir a la página de productos
        Inertia.visit('/productos'); // Aquí puedes poner la ruta a donde deseas redirigir
      },
      onError: (errors) => {
        // Lógica si ocurre un error
        console.error('Error al crear el producto:', errors);
      }
    });
  };

  return (
    <Layout1>
      <div className="max-w-md mx-auto p-4 border rounded-lg shadow-sm bg-white mb-12 mt-12">
        <h2 className="text-xl font-semibold mb-4">Crear Nuevo Producto</h2>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Unidades */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Unidades</label>
            <input
              type="number"
              name="unidades"
              value={formData.unidades}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="imagen"
                className="w-full flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-500 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.5 12.75l6 6 9-9M12 2.25v14.25"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Arrastra o selecciona una imagen
                </span>
                <input
                  id="imagen"
                  type="file"
                  name="imagen"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
            {formData.imagen && (
              <div className="mt-4 flex justify-center">
                <img
                  src={URL.createObjectURL(formData.imagen)}
                  alt="Vista previa"
                  className="h-32 w-32 object-cover rounded-md shadow-md"
                />
              </div>
            )}
          </div>

          {/* Descuento */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Descuento (%)</label>
            <input
              type="number"
              name="descuento"
              value={formData.descuento}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Eliminado */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="eliminado"
              checked={formData.eliminado}
              onChange={(e) => setFormData({ ...formData, eliminado: e.target.checked })}
              className="h-4 w-4 text-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Producto Eliminado</label>
          </div>

          {/* Botón para crear el producto */}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Crear Producto
            </button>
          </div>
        </form>
      </div>
    </Layout1>
  );
};

export default CrearProducto;
