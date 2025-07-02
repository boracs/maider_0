import React from 'react';
import FomrularioContacto from '../components/FormularioContacto';
import Layout1 from '../layouts/Layout1';
import BotonAtras from '../components/Boton_go_back';


const Contacto = ({ children }) => {
  return (
    <Layout1>
    <div className="min-h-screen bg-gray-100">


  
      <main className="container mx-auto p-6">
        {
        < div>
                <FomrularioContacto></FomrularioContacto>
            
        </div>
        }
      </main>
        


    </div>
    </Layout1>
  );
};

export default Contacto;