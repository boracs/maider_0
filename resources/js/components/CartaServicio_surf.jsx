import React from 'react';

const CartaServicio = ({ titulo, descripcion, caracteristicas, precio, onReservar }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">{titulo}</h2>
      <p className="text-gray-700 mb-6">{descripcion}</p>
      <ul className="list-disc list-inside text-gray-600 mb-6">
        {caracteristicas.map((caracteristica, index) => (
          <li key={index} className="pl-4">{caracteristica}</li>
        ))}
      </ul>
      <p className="text-lg font-bold text-gray-800 mb-6">Precio: {precio}</p>
      <button
        onClick={onReservar}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
      >
        Reservar Ahora
      </button>
    </div>
  );
};

export default CartaServicio;
