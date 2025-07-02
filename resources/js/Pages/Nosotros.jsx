import React, { useState } from 'react';
import Layout1 from '../layouts/Layout1';
import '../../css/nosotros.css';

const SobreNosotros = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "https://images.pexels.com/photos/111085/pexels-photo-111085.jpeg?cs=srgb&dl=pexels-bradleyhook-111085.jpg&fm=jpg",
    "https://berriasurfschool.com/wp-content/uploads/2023/07/beneficios-del-surf-para-la-salud.jpg",
    "https://c.files.bbci.co.uk/D4EF/production/_129711545_gettyimages-586626621.jpg",
    "https://dus6dayednven.cloudfront.net/app/uploads/2023/03/Alpha-Universe-IG-FF-Waves-Stan-Moniz-2-3.jpg",
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <Layout1>
      {/* Separador moderno entre el menú principal y el contenido */}
      <div className="relative mt-10 mb-8">
        <div className="w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg"></div>
      </div>

      {/* Sección "Nuestra Historia" y el slider en la misma fila */}
      <div className="flex justify-between gap-8 mb-12">
        {/* Nuestra Historia */}
        <div className="bg-white p-8 rounded-lg shadow-md w-1/2">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Sobre Nosotros</h2>
          <section className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Nuestra Historia</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              En [Nombre de la empresa], nuestra misión es proporcionar experiencias inolvidables a nuestros
              clientes a través de [producto o servicio]. Desde nuestros humildes comienzos en [año], hemos trabajado
              incansablemente para ofrecer un servicio de calidad, innovador y accesible para todos. Nuestra pasión por
              [lo que hace la empresa] nos ha permitido crecer y establecer una comunidad sólida y leal.
            </p>
          </section>
        </div>

        {/* Slider de Testimonios */}
        <div className="bg-gray-50 p-8 rounded-lg shadow-md w-1/2">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Nuestros servicios</h3>

          <div className="slider-container">
            <div className="slider w-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {slides.map((image, index) => (
                <div key={index} className="slide">
                  <img src={image} alt={`Imagen ${index + 1}`} className="w-full h-auto" />
                </div>
              ))}
            </div>

            {/* Botones de navegación */}
            <button className="prev button_nosotros" onClick={prevSlide}>❮</button>
            <button className="next button_nosotros" onClick={nextSlide}>❯</button>
          </div>
        </div>
      </div>

      {/* Sección Nuestras Instalaciones */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-12">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Nuestras Instalaciones</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <img src="/img/toalla_basica.jpg" alt="Instalación 1" className="w-full h-32 object-cover rounded-lg shadow-md"/>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition duration-300 rounded-lg"></div>
          </div>
          <div className="relative group">
            <img src="/img/zurriola.jpg" alt="Instalación 2" className="w-full h-32 object-cover rounded-lg shadow-md"/>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition duration-300 rounded-lg"></div>
          </div>
          <div className="relative group">
            <img src="/img/fondo_olas.jpg" alt="Instalación 3" className="w-full h-32 object-cover rounded-lg shadow-md"/>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition duration-300 rounded-lg"></div>
          </div>
          <div className="relative group">
            <img src="/img/fondo_olas.jpg" alt="Instalación 3" className="w-full h-32 object-cover rounded-lg shadow-md"/>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition duration-300 rounded-lg"></div>
          </div>
          <div className="relative group">
            <img src="/img/fondo_olas.jpg" alt="Instalación 3" className="w-full h-32 object-cover rounded-lg shadow-md"/>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition duration-300 rounded-lg"></div>
          </div>
          <div className="relative group">
            <img src="/img/zurriola.jpg" alt="Instalación 2" className="w-full h-32 object-cover rounded-lg shadow-md"/>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition duration-300 rounded-lg"></div>
          </div>
          <div className="relative group">
            <img src="/img/zurriola.jpg" alt="Instalación 2" className="w-full h-32 object-cover rounded-lg shadow-md"/>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition duration-300 rounded-lg"></div>
          </div>
          <div className="relative group">
            <img src="/img/toalla_basica.jpg" alt="Instalación 1" className="w-full h-32 object-cover rounded-lg shadow-md"/>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition duration-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    </Layout1>
  );
};

export default SobreNosotros;
