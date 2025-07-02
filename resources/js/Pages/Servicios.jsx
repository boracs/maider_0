import React from 'react';
import Layout1  from '../layouts/Layout1';

function Servicios() {
  // Datos de ejemplo de los servicios (puedes modificar esto para que se obtengan desde una base de datos o API)
  const servicios = [
    {
      id: 1,
      title: "Servicio de Surf",
      description: "Clases de surf para todos los niveles, desde principiantes hasta avanzados.",
      icon: "🌊", // Puedes reemplazar esto con un icono o imagen
    },
    {
      id: 2,
      title: "Alquiler de Equipos",
      description: "Alquiler de tablas y trajes de neopreno para disfrutar del surf.",
      icon: "🏄‍♂️",
    },
    {
      id: 3,
      title: "Curso de Primeros Auxilios",
      description: "Formación en primeros auxilios específicos para actividades acuáticas.",
      icon: "🚑",
    },
    {
      id: 4,
      title: "Surf Adaptado",
      description: "Clases de surf adaptadas para personas con diversidad funcional.",
      icon: "♿",
    },
  ];

  return (

    <Layout1>
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Nuestros Servicios</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="bg-white shadow-xl rounded-lg p-8 flex flex-col items-center transition-transform transform hover:scale-105"
          >
            <div className="text-5xl text-indigo-700 mb-6">{servicio.icon}</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{servicio.title}</h3>
            <p className="text-gray-600 text-center mb-6">{servicio.description}</p>
            <button className="px-6 py-3 bg-indigo-700 text-white rounded-lg shadow-md hover:bg-indigo-800 transition-colors">
              Más información
            </button>
          </div>
        ))}
      </div>
    </div>
    </Layout1>
  );
}

export default Servicios;