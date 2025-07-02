import React from 'react';
import '../../css/boton_volver_atras.css';


// funcion apra volver atras podria usar useNavigate  pero es mas simple asi
const goBack = () => {
    window.history.back(); // Esto llevará al usuario a la página anterior
};

const Boton_anadir = () => (
    <button className="boton_atras"  onClick={goBack}>
        Volver atras
    </button>
);

export default Boton_anadir;