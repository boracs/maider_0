import React, { useState } from 'react';
import Producto from '../components/Producto'; // Importar el componente Producto
import Layout1 from '../layouts/Layout1';





const Tienda = ({ productos }) => {
  // Definir el número de productos por página
  const productosPorPagina = 18;

  // Estado para la página actual
  const [paginaActual, setPaginaActual] = useState(1);

  // Función para obtener los productos de la página actual
  const obtenerProductosDePagina = () => {
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    return productos.slice(inicio, fin);
  };

  // Número total de páginas
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

  // Funciones para cambiar de página
  const irAAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };
  const irASiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  return (


        <Layout1>

<div className="p-4 w-[80%] mx-auto">
  <h2 className="text-2xl font-bold mb-4 text-center">Tienda</h2>

  {/* Mostrar productos */}
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {obtenerProductosDePagina().map((producto) => (
      <Producto
        key={producto.id}
        nombre={producto.nombre}
        precio={producto.precio}
        imagen={producto.imagen}
        unidades={producto.unidades}
        descuento={producto.descuento}
        producto={producto}
      />
    ))}
  </div>

  {/* Paginación */}
  <div className="flex justify-center mt-6 space-x-4">
    <button
      onClick={irAAnterior}
      className="px-4 py-2 bg-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={paginaActual === 1}
    >
      Anterior
    </button>
    <span className="text-sm text-gray-600">
      Página {paginaActual} de {totalPaginas}
    </span>
    <button
      onClick={irASiguiente}
      className="px-4 py-2 bg-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={paginaActual === totalPaginas}
    >
      Siguiente
    </button>
  </div>
</div>

            
            </Layout1>
  );
};

export default Tienda;