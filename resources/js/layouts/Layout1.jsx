

import React from 'react';
import Menu_principal from '../components/Menu_principal';
import Titulo from '../components/Titulo';
import Footer from '../components/Footer';
import { CartProvider } from '../Contexts//cartContext'; // Importa el CartProvider





const Layout1 = ({ children, header }) => (
    <div className='layout_1'>
        <Titulo />
        <header className="">
            {/* Aquí se puede pasar contenido específico para el header */}
            {/*englobo El menu principal con cart provider par apoder suar toda las info ysus metodos dentro del menu soin tener que recargar nada */ }
            {header ||      <CartProvider >   <Menu_principal />  </CartProvider>
            }  {/* Si no se pasa un `header`, se usa el predeterminado */}
        </header>
        <main>{children}</main>
        <Footer />
    </div>
);

export default Layout1;