import React from 'react';
import Layout1 from '@/layouts/Layout1';
import CartaServicio from "@/components/CartaServicio_surf";
import Por_que_escogernos_motivo from "@/components/Por_que_escogernos_motivo";

const Servicios_ClasesDeSurf = () => {
    const clases = [
      {
        titulo: "Clase Básica",
        descripcion: "Aprende los fundamentos del surf con instructores certificados. Ideal para principiantes que desean empezar con seguridad.",
        caracteristicas: [
          "Duración: 1,5 horas",
          "Incluye tabla y traje de neopreno",
          "Precio: $50 por persona"
        ],
        precio: "$50",
        onReservar: () => alert('Reservar Clase Básica'),
      },
      {
        titulo: "Clase Avanzada",
        descripcion: "Domina el surf con entrenamiento personalizado y técnicas profesionales. Diseñado para surfistas experimentados.",
        caracteristicas: [
          "Duración: 1,5 horas",
          "Incluye tabla y traje de neopreno",
          "Extras: Videograbación opcional",
          "Precio: $90 por persona"
        ],
        precio: "$90",
        onReservar: () => alert('Reservar Clase Avanzada'),
      },
      {
        titulo: "Cursillo Semanal",
        descripcion: "Cursos grupales de 1 o 2 días por semana diseñados para distintos niveles, desde principiantes hasta avanzados.",
        caracteristicas: [
          "Duración: 1,5 horas por sesión",
          "Precio: 1 día/semana: 60 € | 2 días/semana: 110 €",
          "Máximo 6 personas por monitor"
        ],
        precio: "60 € - 110 €",
        onReservar: () => alert('Reservar Cursillo Semanal'),
      },
      {
        titulo: "Cursillo Mensual",
        descripcion: "Opciones de 1 o 2 días por semana para avanzar de manera consistente, adaptado a distintos niveles.",
        caracteristicas: [
          "Duración: 1,5 horas por sesión",
          "Precio: 1 día/semana: 120 €/mes | 2 días/semana: 200 €/mes",
          "Máximo 6 personas por monitor"
        ],
        precio: "120 € - 200 €/mes",
        onReservar: () => alert('Reservar Cursillo Mensual'),
      },
      {
        titulo: "Clases Particulares",
        descripcion: "Clases diseñadas a medida para adaptarse a tus necesidades específicas con atención personalizada.",
        caracteristicas: [
          "Duración: 1,5 horas",
          "Máximo: 6 personas por grupo",
          "Precio: Según número de personas"
        ],
        precio: "A consultar",
        onReservar: () => alert('Reservar Clases Particulares'),
      },
      {
        titulo: "Special Day",
        descripcion: "Una experiencia única para principiantes que quieren probar el surf. Ideal para quienes nunca han surfeado o lo han hecho pocas veces.",
        caracteristicas: [
          "Duración: 1,5 horas",
          "Incluye tabla y traje de neopreno",
          "Precio: $60 por persona"
        ],
        precio: "$60",
        onReservar: () => alert('Reservar Special Day'),
      },
      {
        titulo: "Surf & Skate Experience",
        descripcion: "Una experiencia combinada única: 2 horas de surf y 2 horas de skate para mejorar tu equilibrio y técnica.",
        caracteristicas: [
          "Duración: 5 días (lunes a viernes)",
          "Incluye tabla de surf, traje de neopreno y equipo de skate",
          "Precio: 50 € por persona"
        ],
        precio: "50 €",
        onReservar: () => alert('Reservar Surf & Skate Experience'),
      }
    ];
  
    return (
      <Layout1>
        <div className="max-w-7xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-blue-100 shadow-2xl rounded-2xl">
          <h1 className="text-5xl font-extrabold text-center text-blue-900 mb-12">
            Clases de Surf <span className="text-blue-600">Profesionales</span>
          </h1>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clases.map((clase, index) => (
              <CartaServicio
                key={index}
                titulo={clase.titulo}
                descripcion={clase.descripcion}
                caracteristicas={clase.caracteristicas}
                precio={clase.precio}
                onReservar={clase.onReservar}
              />
            ))}
          </div>
          
              <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-4xl font-bold text-blue-900 mb-6 text-center">Contrata un Fotógrafo para tu Sesión</h2>
                <table className="table-auto w-full text-left border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Número de Personas</th>
                      <th className="border border-gray-300 px-4 py-2">Duración</th>
                      <th className="border border-gray-300 px-4 py-2">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">1 persona</td>
                      <td className="border border-gray-300 px-4 py-2">1,5 horas</td>
                      <td className="border border-gray-300 px-4 py-2">40 €</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">2 personas</td>
                      <td className="border border-gray-300 px-4 py-2">1,5 horas</td>
                      <td className="border border-gray-300 px-4 py-2">65 €</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">3 personas</td>
                      <td className="border border-gray-300 px-4 py-2">1,5 horas</td>
                      <td className="border border-gray-300 px-4 py-2">80 €</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">4 o más personas</td>
                      <td className="border border-gray-300 px-4 py-2">1,5 horas</td>
                      <td className="border border-gray-300 px-4 py-2">90 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>

               {/* Sección de Confianza */}
               <div className="mt-16 text-center bg-white p-8 rounded-xl shadow-lg mb-12">
                        <h2 className="text-4xl font-bold text-blue-900 mb-6">
                            ¿Por qué elegirnos?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Por_que_escogernos_motivo
                                        title="Seguridad Primero"
                                        paragraph="Todas nuestras clases siguen protocolos de seguridad rigurosos."
                                        bgColor="bg-blue-50"
                                        textColor= "text-blue-800"
                                    />
                                      <Por_que_escogernos_motivo
                                        title="Instructores Certificados"
                                        paragraph="Nuestros instructores tienen años de experiencia y certificaciones internacionales."
                                        bgColor="bg-green-50"
                                        textColor="text-green-800"
                                    />
                                      <Por_que_escogernos_motivo
                                        title="Equipo de Calidad"
                                        paragraph="Utilizamos tablas y trajes de neopreno de marcas líderes en el mercado."
                                        bgColor="bg-purple-50"
                                        textColor="text-purple-800"
                                    />

                        </div>
                    </div>      

            </div>


</Layout1>

);
}
export default Servicios_ClasesDeSurf;