import React from 'react';
import Layout1 from '@/layouts/Layout1';

const SurfTrips = () => { return (

 < Layout1>
      <div className="max-w-6xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-blue-100 shadow-2xl rounded-2xl">
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12">
          SurfTrips <span className="text-teal-600">TOP PREMIUM</span>
        </h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* PACK 1 – PAÍS VASCO */}
          <div className="bg-gradient-to-r from-teal-400 to-teal-600 text-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-bold mb-6">PACK 1 – PAÍS VASCO</h2>
            <p className="mb-6">
              Excursión de surf de 4 horas (09:00-13:00 horas) en las mejores playas del País Vasco.
            </p>
            <ul className="list-disc list-inside mb-6">
              <li>1 persona – 120,00€</li>
              <li>2 personas – 80,00€/pax</li>
              <li>3 personas – 60,00€/pax</li>
              <li>4 personas – 50,00€/pax</li>
            </ul>
  
            <h3 className="text-xl font-semibold mb-3">Opción con Menú</h3>
            <ul className="list-disc list-inside mb-6">
              <li>Menú del día – 30,00€/pax</li>
              <li>Menú sidrería – 50,00€/pax</li>
            </ul>
  
            <button className="w-full bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-lg transition duration-300 font-semibold">
              Reservar Ahora
            </button>
          </div>
  
          {/* PACK 2 – CÔTE BASQUE */}
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-bold mb-6">PACK 2 – CÔTE BASQUE</h2>
            <p className="mb-6">
              Excursión de surf de 4 horas (09:00-13:00 horas) en la espectacular Costa Vasca.
            </p>
            <ul className="list-disc list-inside mb-6">
              <li>1 persona – 140,00€</li>
              <li>2 personas – 100,00€/pax</li>
              <li>3 personas – 80,00€/pax</li>
              <li>4 personas – 60,00€/pax</li>
            </ul>
  
            <h3 className="text-xl font-semibold mb-3">Opción con Menú</h3>
            <ul className="list-disc list-inside mb-6">
              <li>Menú del día – 30,00€/pax</li>
              <li>Menú sidrería – 50,00€/pax</li>
            </ul>
  
            <button className="w-full bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg transition duration-300 font-semibold">
              Reservar Ahora
            </button>
          </div>
  
          {/* PACK 3 – LAS LANDAS */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-bold mb-6">PACK 3 – LAS LANDAS</h2>
            <p className="mb-6">
              Excursión de surf de 4 horas (09:00-13:00 horas) en las hermosas playas de Las Landas.
            </p>
            <ul className="list-disc list-inside mb-6">
              <li>1 persona – 200,00€</li>
              <li>2 personas – 150,00€/pax</li>
              <li>3 personas – 100,00€/pax</li>
              <li>4 personas – 75,00€/pax</li>
            </ul>
  
            <h3 className="text-xl font-semibold mb-3">Opción con Menú</h3>
            <ul className="list-disc list-inside mb-6">
              <li>Menú del día – 30,00€/pax</li>
              <li>Menú sidrería – 50,00€/pax</li>
            </ul>
  
            <button className="w-full bg-orange-700 hover:bg-orange-800 text-white px-6 py-3 rounded-lg transition duration-300 font-semibold">
              Reservar Ahora
            </button>
          </div>
        </div>
      </div>
      </Layout1>
    );
  

};

export default SurfTrips;