import React, { useState, useEffect } from 'react';
import Producto from '../components/Producto';
import Layout1 from '../layouts/Layout1';

const Tienda = ({ productos }) => {
  const productosPorPagina = 18;
  const [paginaActual, setPaginaActual] = useState(1);



const productosOrdenados = [...productos].sort((a, b) => {
  const nameA = a.nombre.toLowerCase();
  const nameB = b.nombre.toLowerCase();
  if (nameA < nameB) return -1;
  if (nameA > nameB) return 1;
  return a.id - b.id; // Orden secundario por id
});

productos.forEach(p => console.log(p.nombre, p.imagenPrincipal));



/////////////////////////ORDENACION/////////////////////////////////////
//me veo obligado a hacer esto porque el orden que me llega del backend es aleatorio DEBIDO A QUE INERTIA NO ME PERMITE ORDENAR POR NOMBRE PORQUE AL 
// ENVIARLSO EN JSON ME LO DESORDENA
const obtenerProductosDePagina = () => {
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = productosOrdenados.slice(inicio, fin);

    return productosPagina;
  };
//////////////////////////////FIN ORDENACION////////////////////////////////




  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

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
                  imagenes={producto.imagenes} // 🔹 Pasamos todas las imágenes
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
