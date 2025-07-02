import React from "react";
import Layout1 from "../layouts/Layout1";
import "../../css/pagina_principal.css";
import Contenedor_productos from "../layouts/Contenedor_productos";
import { Head } from "@inertiajs/react";
import Contenedor_opciones from "../layouts/Contenedor_opciones";
import OpcionesIntro from "../components/OpcionesIntro";
import Por_que_escogernos_motivo from "../components/Por_que_escogernos_motivo";

const Pag_principal = ({ productos }) => (
    <div>
        <Layout1>
            <Head>
                <title>Página Principal</title>
                <meta
                    name="description"
                    content="Explora nuestros productos disponibles"
                />
            </Head>
            <main>
                <div className="contenedor_del_contenedor_opciones"></div>
                <div>
                    <OpcionesIntro></OpcionesIntro>

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

                    {productos.length > 0 ? (
                        <Contenedor_productos
                            productos={productos}
                            className="contenedor_productos"
                        ></Contenedor_productos>
                    ) : (
                        <p>No hay productos disponibles actualmente.</p>
                    )}

                </div>
            </main>
        </Layout1>
    </div>
);

export default Pag_principal;
