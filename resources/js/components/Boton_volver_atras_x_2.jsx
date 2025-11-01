import React from "react";

const VolverAtras = () => {
    const irAtras = () => {
        window.history.go(-2); // Retroceder dos pasos en el historial
    };

    return (
        <button
            onClick={irAtras}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-105 active:transform active:scale-95"
        >
            Seguir comprando
        </button>
    );
};

export default VolverAtras;
