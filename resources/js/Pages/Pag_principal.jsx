import React from "react";
import Layout1 from "../layouts/Layout1";
import "../../css/pagina_principal.css"; // dejamos tu CSS actual
import Contenedor_productos from "../layouts/Contenedor_productos";
import { Head } from "@inertiajs/react";
import OpcionesIntro from "../components/OpcionesIntro";
import Por_que_escogernos_motivo from "../components/Por_que_escogernos_motivo";

// Datos internos de la página
const motivos = [
  {
    title: "Seguridad Primero",
    paragraph: "Todas nuestras clases siguen protocolos de seguridad rigurosos",
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
  },
  {
    title: "Instructores Certificados",
    paragraph: "Nuestros instructores tienen años de experiencia y certificaciones internacionales.",
    bgColor: "bg-green-50",
    textColor: "text-green-800",
  },
  {
    title: "Equipo de Calidad",
    paragraph: "Utilizamos tablas y trajes de neopreno de marcas líderes en el mercado.",
    bgColor: "bg-purple-50",
    textColor: "text-purple-800",
  },
];

const Pag_principal = ({ productos }) => (
  <Layout1>
    <Head>
      <title>Página Principal</title>
      <meta name="description" content="Explora nuestros productos disponibles" />
    </Head>

    <main className="px-4 sm:px-6 md:px-12">
      {/* Sección de introducción */}
      <OpcionesIntro />

      {/* Sección de Confianza */}
      <section className="mt-12 sm:mt-16 text-center bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-6">
          ¿Por qué elegirnos?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {motivos.map((m, index) => (
            <Por_que_escogernos_motivo key={index} {...m} />
          ))}
        </div>
      </section>

      {/* Sección de Productos */}
      {productos.length > 0 ? (
        <Contenedor_productos
          productos={productos}
          className="contenedor_productos grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        />
      ) : (
        <p className="text-center text-gray-700">No hay productos disponibles actualmente.</p>
      )}
    </main>
  </Layout1>
);

export default Pag_principal;
