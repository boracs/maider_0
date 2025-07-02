import React, { useRef } from 'react';
import ProductoOferta from '../components/ProductoOferta';

const Contenedor_productos = ({ productos }) => {
  const productosContainerRef = useRef();

  // Función para desplazar el contenedor a la izquierda
  const scrollLeft = () => {
    if (productosContainerRef.current) {
      productosContainerRef.current.scrollBy({
        left: -300, // Desplazamiento a la izquierda
        behavior: 'smooth', // Desplazamiento suave
      });
    }
  };

  // Función para desplazar el contenedor a la derecha
  const scrollRight = () => {
    if (productosContainerRef.current) {
      productosContainerRef.current.scrollBy({
        left: 300, // Desplazamiento a la derecha
        behavior: 'smooth', // Desplazamiento suave
      });
    }
  };

  return (



    <div className="w-full h-full flex justify-center items-center relative">
      
      <div
        ref={productosContainerRef}
        className="flex overflow-x-hidden p-4 w-[90%] space-x-4"
      >
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="min-w-[200px] max-w-[300px] flex-shrink-0"
          >
            <ProductoOferta
              nombre={producto.nombre}
              precio={producto.precio}
              imagen={producto.imagen}
              unidades={producto.unidades}
              descuento={producto.descuento}
              producto={producto}
            />
          </div>
        ))}
      </div>

      {/* Botón para mover a la izquierda, cerca del primer producto */}
      <button
        onClick={scrollLeft}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white p-2 rounded-full z-10 transition-all hover:bg-gray-700 focus:outline-none shadow-lg"
      >
        ←
      </button>

      {/* Botón para mover a la derecha, cerca del último producto */}
      <button
        onClick={scrollRight}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white p-2 rounded-full z-10 transition-all hover:bg-gray-700 focus:outline-none shadow-lg"
      >
        →
      </button>
    </div>
  );
};

export default Contenedor_productos;