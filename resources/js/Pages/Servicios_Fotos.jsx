import React from 'react';
import Layout1 from '@/layouts/Layout1';

const SurfClasses = () => {
    return (
           <Layout1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-12">
                    {/* Bono de 1h */}
                    <div className="bg-blue-100 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <h2 className="text-3xl font-bold text-blue-800 mb-6">Bono de 1 Hora</h2>
                        <p className="text-gray-700 mb-6">
                            Una hora de pura diversión en el agua para mejorar tus habilidades en el surf.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 mb-6">
                            <li>Duración: 1 hora</li>
                            <li>Incluye fotos (sin garantía de que aparezcas en todas)</li>
                            <li>Precio: 10 € por persona</li>
                        </ul>
                        <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold">
                            Reservar Ahora
                        </button>
                    </div>

                    {/* Bono de 1,5h */}
                    <div className="bg-green-100 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <h2 className="text-3xl font-bold text-green-800 mb-6">Bono de 1,5 Horas</h2>
                        <p className="text-gray-700 mb-6">
                            Un poco más de tiempo para perfeccionar tu técnica y disfrutar del mar.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 mb-6">
                            <li>Duración: 1.5 horas</li>
                            <li>Incluye fotos (sin garantía de que aparezcas en todas)</li>
                            <li>Precio: 15 € por persona</li>
                        </ul>
                        <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold">
                            Reservar Ahora
                        </button>
                    </div>

                    {/* Bono semanal */}
                    <div className="bg-orange-100 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <h2 className="text-3xl font-bold text-orange-800 mb-6">Bono Semanal</h2>
                        <p className="text-gray-700 mb-6">
                            Disfruta de una semana completa de clases de surf para llevar tus habilidades al siguiente nivel.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 mb-6">
                            <li>Duración: 5 días (lunes a viernes)</li>
                            <li>Incluye fotos (sin garantía de que aparezcas en todas)</li>
                            <li>Precio: 50 € por persona</li>
                        </ul>
                        <button className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition duration-300 font-semibold">
                            Reservar Ahora
                        </button>
                    </div>

                    {/* Bono grupal */}
                    <div className="bg-purple-100 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <h2 className="text-3xl font-bold text-purple-800 mb-6">Bono Grupal</h2>
                        <p className="text-gray-700 mb-6">
                            Perfecto para disfrutar en grupo y aprender juntos las mejores técnicas de surf.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 mb-6">
                            <li>Duración: 2 horas</li>
                            <li>Incluye fotos (sin garantía de que aparezcas en todas)</li>
                            <li>Precio: 80 € por grupo (máximo 5 personas)</li>
                        </ul>
                        <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold">
                            Reservar Ahora
                        </button>
                    </div>

                    {/* Bono básico */}
                    <div className="bg-yellow-100 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <h2 className="text-3xl font-bold text-yellow-800 mb-6">Bono Básico</h2>
                        <p className="text-gray-700 mb-6">
                            Perfecto para quienes quieren iniciarse en el surf. Fotos incluidas, pero no garantizadas.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 mb-6">
                            <li>Duración: 1 clase</li>
                            <li>Incluye fotos (sin garantía de que aparezcas en todas)</li>
                            <li>Precio: 5 € por persona</li>
                        </ul>
                        <button className="w-full bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition duration-300 font-semibold">
                            Reservar Ahora
                        </button>
                    </div>
                </div>

        </Layout1>

        );
        }
        export default SurfClasses;