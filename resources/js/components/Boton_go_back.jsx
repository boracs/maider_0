import React from "react";
import "../../css/boton_volver_atras.css";

// función para volver atrás
const goBack = () => {
    window.history.back(); // Esto llevará al usuario a la página anterior
};

const Boton_anadir = () => (
    <button className="boton_atras" onClick={goBack}>
        Volver Atrás
    </button>
);

export default Boton_anadir;
