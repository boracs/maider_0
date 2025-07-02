import React from 'react';

const VolverAtras = () => {
    const irAtras = () => {
        window.history.go(-2);  // Esto retrocede dos pasos en el historial
    };

    return (
        <button onClick={irAtras} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Seguir comprando
        </button>
    );
};

export default VolverAtras;