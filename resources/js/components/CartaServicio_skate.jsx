import React from 'react';

const ClaseSkate = ({ titulo, descripcion, opciones, onReservar }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
      <h2 className="text-3xl font-bold text-green-800 mb-6">{titulo}</h2>
      <p className="text-gray-700 mb-6">{descripcion}</p>
      
      {/* Mostrar cada opción de clase */}
      <div className="space-y-4">
        {opciones.map((opcion, index) => (
          <div key={index} className="border border-gray-200 p-4 rounded-lg">
            <ul className="list-disc list-inside text-gray-600 mb-6 whitespace-pre-line">
              {opcion.duracion && <li>Duración: {opcion.duracion}</li>}
              {opcion.material && <li>Material incluido: {opcion.material}</li>}
              {opcion.descripcion && <li>{opcion.descripcion}</li>}
            </ul>
            <p className="text-lg font-bold text-gray-800 mb-6">Precio: {opcion.precio} €</p>
            <button
              onClick={() => onReservar(opcion)}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
            >
              Reservar Ahora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClaseSkate;
