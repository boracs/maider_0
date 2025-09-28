import React from 'react';
import Menu_principal from '../components/Menu_principal';
import Titulo from '../components/Titulo';
import Footer from '../components/Footer';
import { CartProvider } from '../Contexts//cartContext';
// 💡 Asegúrate de que esta ruta relativa sea correcta y que el archivo exista.
import Chatbot from '../components/Chatbot.jsx'; 
import { usePage } from '@inertiajs/react'; 


const Layout1 = ({ children, header }) => {
    
    // 1. Obtener las props globales de Inertia
    const { props } = usePage();
    const user = props.auth?.user; 
    
    // 2. Determinar el estado de autenticación y rol
    const loggedIn = !!user; 
    
    // ASUMIMOS que el rol está en user.role y que 'admin' es el valor.
    // 💡 Ajusta user.role === 'admin' a la lógica de tu backend.
    const isAdmin = user && user.role === 'admin'; 

    // 3. Condición de Renderizado: Mostrar si NO es un administrador
    const shouldRenderChatbot = !isAdmin;
    
    return (
        <div className='layout_1'>
            <Titulo />
            <header className="">
                {header ||      
                    <CartProvider > 
                        <Menu_principal /> 
                    </CartProvider>
                } 
            </header>
            
            <main>{children}</main>
            
            <Footer />
            
            {/* 4. RENDERIZADO CONDICIONAL DEL CHATBOT */}
            {shouldRenderChatbot && <Chatbot loggedIn={loggedIn} />}
            
        </div>
    );
};

export default Layout1;