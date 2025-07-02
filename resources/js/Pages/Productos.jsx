import React, { useState } from 'react';
import Layout1 from '../layouts/Layout1';
import { Inertia } from '@inertiajs/inertia';
import { Link } from '@inertiajs/inertia-react';

export default function Productos({ productos }) {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    unidades: '',
    descuento: '',
    imagen: null, // Aquí se guarda la imagen seleccionada
  });

  // Maneja el clic en un producto para mostrar las opciones
  const handleProductoClick = (producto) => {
    setProductoSeleccionado(producto);
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio,
      unidades: producto.unidades,
      descuento: producto.descuento,
      imagen: producto.imagen ? `/storage/productos/${producto.imagen}` : '', // Mostrar imagen actual si existe
    });
  };

  // Maneja el cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Función para manejar el cambio de imagen
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Obtener el archivo seleccionado
    if (file) {
        setFormData((prevData) => ({
            ...prevData,
            imagen: file, // Guardar el archivo en el estado
        }));
    }
};

  const handleEliminar = () => {
    if (!productoSeleccionado) return;

    Inertia.put(route('producto.eliminar', { id: productoSeleccionado.id }), {
      onSuccess: () => {
        // Esto podría ser útil para algún tipo de notificación de éxito
      },
      onError: (errors) => {
        console.error('Error al cambiar el estado del producto:', errors);
      }
    });
  };




  // Función para manejar la modificación del producto
  const handleModificar = async (event) => {
    event.preventDefault();
  
    // Validar que se haya seleccionado un producto
    if (!productoSeleccionado) {
      alert('Selecciona un producto para modificar.');
      return;
    }
  
    // Validar campos obligatorios
    if (!formData.nombre || !formData.precio || !formData.unidades) {
      alert('Por favor, rellena todos los campos requeridos.');
      return;
    }
  
    // Crear FormData para enviar datos
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('precio', formData.precio);
    formDataToSend.append('unidades', formData.unidades);
    formDataToSend.append('descuento', formData.descuento || 0); // Descuento opcional
  
    // Verificar que formData.imagen no sea null y que sea un archivo válido
    if (formData.imagen && formData.imagen instanceof File) {
      formDataToSend.append('imagen', formData.imagen); // Añadir imagen
    } else {
      console.log("No se ha seleccionado ninguna imagen.");
    }
  
    // Depuración para ver todos los valores añadidos a FormData
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value); // Imprimir cada par clave-valor
    }
  
    
    // Enviar datos al backend usando Inertia con el método POST

    Inertia.post(route('producto.edit', { id: productoSeleccionado.id }), formDataToSend, {
    });
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
                  className={`flex flex-col items-center p-3 border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 ${producto.unidades < 5 ? 'bg-red-200' : ''} max-w-[200px] relative`}
                  onClick={() => handleProductoClick(producto)}
                >
                  {/* Capa de oscuridad aplicada si el producto está seleccionado */}
                  {productoSeleccionado && productoSeleccionado.id === producto.id && (
                     <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
                  )}

                  {producto.eliminado === 1 && (
                    <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg"></div>
                  )}
                  <img
                    src={producto.imagen ? `/storage/productos/${producto.imagen}` : '/productos/default-image.jpg'}
                    alt={producto.imagen}
                    className={`w-24 h-24 object-cover rounded-lg mb-2 ${producto.eliminado === 1 ? 'opacity-50' : ''}`}
                  />
                  <p className="text-center text-sm font-medium text-blue-600">{producto.nombre}</p>
                  <div className="text-center text-sm text-gray-600">
                    <p>Cantidad: <span className="font-semibold">{producto.unidades}</span></p>
                    <p>Precio: <span className="font-semibold text-green-600">${producto.precio}</span></p>
                    {producto.descuento > 0 && (
                      <p>Descuento: <span className="font-semibold text-red-600">{producto.descuento}%</span></p>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-center mt-12 bg-black bg-opacity-10 items-center py-6">
            <button
              type="submit"
              className="w-200 py-2 px-12 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Link href="/producto-store-show" className="w-full">
                Crear Producto
              </Link>
            </button>
          </div>
        </div>

        {productoSeleccionado && (
          <div className="lg:w-[250px] p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-3">Opciones para: {productoSeleccionado.nombre}</h3>
            <div className="flex justify-center mb-4">
              <img
                src={formData.imagen instanceof File ? URL.createObjectURL(formData.imagen) : formData.imagen}
                alt={productoSeleccionado.nombre}
                className="w-48 h-48 object-cover rounded-lg shadow-sm"
              />
            </div>
            <div className="space-y-4">
              <button
                className={`w-full py-2 px-4 ${productoSeleccionado.eliminado ? 'bg-green-600' : 'bg-red-600'} text-white font-semibold rounded-lg shadow-sm hover:bg-${productoSeleccionado.eliminado ? 'green' : 'red'}-700 focus:outline-none focus:ring-2 focus:ring-${productoSeleccionado.eliminado ? 'red' : 'red'}-500`}
                onClick={handleEliminar}
              >
                {productoSeleccionado.eliminado ? 'Activar Producto' : 'Desactivar Producto'}
              </button>

              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-3">Modificar Producto</h4>
                <form className="space-y-3" method="POST"  encType="multipart/form-data" onSubmit={handleModificar}>

                <div>
                    <label className="block text-xs font-medium text-gray-700">Imagen</label>
                    <div
                      className="mt-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => document.getElementById('image-input').click()}
                    >
                      <span className="text-sm text-gray-600">Haz clic para seleccionar una imagen</span>
                      <input
                        type="file"
                        name="imagen"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        id="image-input"
                      />
                    </div>

                    {formData.imagen && (
                      <div className="mt-4 flex items-center space-x-2">
                        <span className="text-xs text-gray-600">Imagen seleccionada</span>
                      </div>
                    )}
                  </div>


                  <div>
                    <label className="block text-xs font-medium text-gray-700">Nombre</label>
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
                    <label className="block text-xs font-medium text-gray-700">Precio</label>
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
                    <label className="block text-xs font-medium text-gray-700">Unidades</label>
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
                    <label className="block text-xs font-medium text-gray-700">Descuento (%)</label>
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
