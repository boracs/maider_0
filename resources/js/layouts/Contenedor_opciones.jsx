import React from 'react';
import '../../css/contenedor_opciones.css';

const Contenedor_opciones = () => {
  return (
    <div className="contenedor-padre">
      <a href="" className="contenedor">
        <div className="contenido">
          <h2>Ir a la tienda</h2>
        </div>
      </a>
      <a href="" className="contenedor">
        <div className="contenido">
          <h2>Surf trips</h2>
        </div>
      </a>
      <a href="" className="contenedor">
        <div className="contenido">
          <h2>Cles de surf</h2>
        </div>
      </a>
      <a href="" className="contenedor">
        <div className="contenido">
          <h2>Contactanos</h2>
        </div>
      </a>
    </div>
  );
};

export default Contenedor_opciones;