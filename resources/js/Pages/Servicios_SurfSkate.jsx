import React from 'react';
import Layout1 from '@/layouts/Layout1';
import CartaServicio_skate from  '@/components/CartaServicio_skate';

const Servicio_SurfSkate = () => {

    // Definir las opciones en un array
    const opcionesClases = [
      {
        titulo: "Individual - Principiante",
        descripcion: "Clase privada de 1,5 horas ideal para quienes nunca han practicado skate o surf. Recibe atención personalizada y aprende lo básico.",
        opciones: [
          { duracion: "1,5 horas", precio: "50", material: "No incluido", descripcion: "Clase personalizada" },
        ]
      },
      {
        titulo: "Grupal - Principiante",
        descripcion: "Clase grupal de 1,5 horas dirigida a quienes nunca han practicado skate o surf. Aprende lo básico de manera divertida con otros principiantes.",
        opciones: [
          { duracion: "1,5 horas", precio: "25", material: "No incluido", descripcion: "Grupo de principiantes" },
        ]
      },
      {
        titulo: "Grupal - Intermedio",
        descripcion: "Clase grupal de 1,5 horas para quienes ya tienen nociones de skate o surf y buscan mejorar su técnica en grupo.",
        opciones: [
          { duracion: "1,5 horas", precio: "25", material: "No incluido", descripcion: "Mejora tu técnica en grupo" },
        ]
      },
      {
        titulo: "Grupal - Avanzado",
        descripcion: "Clase grupal de 1,5 horas diseñada para niveles avanzados. Perfecciona tu técnica y aprende trucos nuevos con un grupo de igual nivel.",
        opciones: [
          { duracion: "1,5 horas", precio: "25", material: "No incluido", descripcion: "Nivel avanzado" },
        ]
      },
      {
        titulo: "Surf & Skate Experience",
        descripcion: "Una experiencia combinada única: 2 horas de surf y 2 horas de skate para mejorar tu equilibrio y técnica.",
        opciones: [
          { duracion: "5 días (lunes a viernes)", precio: "50", material: "Incluye tabla de surf, traje de neopreno y equipo de skate", descripcion: "Mejora tu equilibrio" },
        ]
      },
      {
        titulo: "Mensual (1 clase por semana)",
        descripcion: "Opción mensual para quienes desean clases regulares. 1 clase por semana para avanzar progresivamente en skate o surf.",
        opciones: [
          { duracion: "1 mes (4 clases)", precio: "100", material: "No incluido", descripcion: "Opción mensual" },
        ]
      },
      {
        titulo: "Mensual (2 clases por semana)",
        descripcion: "Opción mensual para quienes desean clases regulares dos veces por semana, acelerando su progreso en skate o surf.",
        opciones: [
          { duracion: "1 mes (8 clases)", precio: "150", material: "No incluido", descripcion: "Opción mensual avanzada" },
        ]
      },
    ];
  
    // Función de reserva (puedes personalizarla)
    const onReservar = (opcion) => {
      console.log("Reservado:", opcion);
    };
  
    return (
      <Layout1>
                <div className="max-w-6xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-blue-100 shadow-2xl rounded-2xl">
                <h1 className="text-5xl font-extrabold text-center text-blue-900 mb-12">
                    Clases de Skate <span className="text-blue-600">Profesionales</span>
                </h1>
        
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {opcionesClases.map((clase, index) => (
                    <CartaServicio_skate
                        key={index}
                        titulo={clase.titulo}
                        descripcion={clase.descripcion}
                        opciones={clase.opciones}
                        onReservar={onReservar}
                    />
                    ))}
                </div>
                </div>
                <div>
                    <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">

                        <h2 className="text-4xl font-bold text-blue-900 mb-6 text-center"> Clases de Skate 1,5 h</h2>
                        <table className="table-auto w-full text-left border-collapse border border-gray-300">
                        <thead>
                            <tr>
                            <th className="border border-gray-300 px-4 py-2">Tipo de Clase</th>
                            <th className="border border-gray-300 px-4 py-2">Duración</th>
                            <th className="border border-gray-300 px-4 py-2">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                        
                            <tr>
                            <td className="border border-gray-300 px-4 py-2">Individual - Principiante</td>
                            <td className="border border-gray-300 px-4 py-2">1,5 horas</td>
                            <td className="border border-gray-300 px-4 py-2">50 €</td>
                            </tr>
                            <tr>
                            <td className="border border-gray-300 px-4 py-2">Grupal - Principiante</td>
                            <td className="border border-gray-300 px-4 py-2">1,5 horas</td>
                            <td className="border border-gray-300 px-4 py-2">25 €</td>
                            </tr>
                            <tr>
                            <td className="border border-gray-300 px-4 py-2">Grupal - Intermedio</td>
                            <td className="border border-gray-300 px-4 py-2">1,5 horas</td>
                            <td className="border border-gray-300 px-4 py-2">25 €</td>
                            </tr>
                            <tr>
                            <td className="border border-gray-300 px-4 py-2">Grupal - Avanzado</td>
                            <td className="border border-gray-300 px-4 py-2">1,5 horas</td>
                            <td className="border border-gray-300 px-4 py-2">25 €</td>
                            </tr>
                            <tr>
                            <td className="border border-gray-300 px-4 py-2">Surf y Skate - 4 horas</td>
                            <td className="border border-gray-300 px-4 py-2">4 horas</td>
                            <td className="border border-gray-300 px-4 py-2">80 €</td>
                            </tr>
                            <tr>
                            <td className="border border-gray-300 px-4 py-2">Mensual (1 clase por semana)</td>
                            <td className="border border-gray-300 px-4 py-2">1 mes (4 clases)</td>
                            <td className="border border-gray-300 px-4 py-2">100 €</td>
                            </tr>
                            <tr>
                            <td className="border border-gray-300 px-4 py-2">Mensual (2 clases por semana)</td>
                            <td className="border border-gray-300 px-4 py-2">1 mes (8 clases)</td>
                            <td className="border border-gray-300 px-4 py-2">150 €</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                    <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">


                    </div> 
                </div>


</Layout1>

);
}
export default Servicio_SurfSkate;