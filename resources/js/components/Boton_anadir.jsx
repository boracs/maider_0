import React from 'react';


const Boton_anadir = ({ onClick, label, disabled, unidades }) => (
    <button 
        className={`w-full px-4 py-2 text-white font-medium rounded-md transition-colors duration-300 ${
            disabled || unidades === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        onClick={onClick} // Usa la función `onClick` pasada como prop
        disabled={disabled || unidades === 0} // Deshabilita si no hay unidades
    >
        {unidades === 0 ? 'Producto agotado' : 'Añadir al carrito'} {/* Cambia el texto según las unidades */}
        {unidades === 0 && (
            <span className="tooltip">El producto ya no está disponible</span> // Tooltip al hacer hover
        )}
    </button>
);

export default Boton_anadir;