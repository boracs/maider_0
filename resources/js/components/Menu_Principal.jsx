import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faBars } from '@fortawesome/free-solid-svg-icons'; // Íconos
import { ChevronDownIcon } from '@heroicons/react/24/solid'; // Ícono de flecha
import Dropdown from '@/Components/Dropdown';
import { useCartContext } from '../../js/Contexts/cartContext';
import ToggleMenu from '../components/ToggleMenu';

const Menu_Principal = () => {
    const { cartCount } = useCartContext();
    const { auth } = usePage().props;
    const user = auth?.user;
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const menuItemsServicios = [
        { href: "servicios.surf", label: "Clases de Surf" },
        { href: "servicios.surfSkate", label: "Clases de Skate" },
        { href: "servicios.surfTrips", label: "SurfTrips" },
        { href: "servicios.fotografia", label: "Fotos" },
    ];

    const menuItemsTienda = [
        { href: "tienda", label: "Tienda-ofertas" },
        { href: "tienda.oficial", label: "Tienda-ofertas-top" },
    ];

    return (
        <nav className="bg-gray-900 shadow-2xl">
            <div className="w-full h-px bg-white opacity-20"></div>
            <div className=" w-full bcontainer mx-auto  px-4 py-3 flex items-center justify-between">
                {/* Logo o nombre de la marca */}
                <Link href={route('Pag_principal')} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-yellow-500 hover:to-pink-500 transition duration-500">
                    + Que Surf
                </Link>
    
                {/* Menú para desktop */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link href={route('Pag_principal')} className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                            Inicio
                        </Link>
                        <Link href={route('nosotros')} className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                            Nosotros
                        </Link>

                        {/* Tienda con flecha */}
                        <ToggleMenu menuItems={menuItemsTienda}>
                            <div className="flex items-center space-x-1 cursor-pointer group">
                                <span className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">Tienda</span>
                                <ChevronDownIcon className="w-4 h-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:via-red-500 group-hover:to-yellow-500 transition duration-500" />
                            </div>
                        </ToggleMenu>

                        {/* Servicios con flecha */}
                        <ToggleMenu menuItems={menuItemsServicios}>
                            <div className="flex items-center space-x-1 cursor-pointer group">
                                <span className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">Servicios</span>
                                <ChevronDownIcon className="w-4 h-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:via-red-500 group-hover:to-yellow-500 transition duration-500" />
                            </div>
                        </ToggleMenu>

                        {/* Condición para mostrar Contacto */}
                        {(!user || user.role !== 'admin') && (
                            <Link href={route('contacto')} className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                Contacto
                            </Link>
                        )}

                        {user && (
                            <>
                                {user.role != 'admin' && (
                                    <Link href={route('pedidos')} className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                        Pedidos
                                    </Link>
                                )}
                                {/* Solo para admin */}
                                {user.role === 'admin' && (
                                    <>
                                        <Link href={route('mostrar.productos')} className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                            Productos
                                        </Link>
                                        <Link href={route('asignar.taquilla.mostrar')} className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                            Taquilla
                                        </Link>
                                        <Link href={route('gestor.pedidos')} className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                            Gestor pedidos
                                        </Link>
                                    </>
                                )}
                                {user.role != 'admin' && (
                                    <Link href={route('carrito')} className="flex items-center text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                        <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                                        Carrito
                                        {cartCount > 0 && (
                                            <span className="ml-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-xs rounded-full px-2 py-1">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

    
                {/* Menú de Cuenta (Login/Register o Perfil) */}
                <div className="flex items-center space-x-4">
                    {user ? (
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 px-3 py-2 text-sm font-medium leading-4 text-white hover:from-yellow-500 hover:to-pink-500 transition duration-500 focus:outline-none"
                                    >
                                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                                        {user.name || 'Mi cuenta'}
                                        <ChevronDownIcon className="-me-0.5 ms-2 h-4 w-4" />
                                    </button>
                                </span>
                            </Dropdown.Trigger>
    
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Perfil</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Cerrar sesión
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    ) : (
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 px-3 py-2 text-sm font-medium leading-4 text-white hover:from-yellow-500 hover:to-pink-500 transition duration-500 focus:outline-none"
                                    >
                                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                                        Cuenta
                                        <ChevronDownIcon className="-me-0.5 ms-2 h-4 w-4" />
                                    </button>
                                </span>
                            </Dropdown.Trigger>
    
                            <Dropdown.Content>
                                <Dropdown.Link href={route('login')}>Login</Dropdown.Link>
                                <Dropdown.Link href={route('register')}>Register</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    )}
                </div>
    
                {/* Menú hamburguesa para móviles */}
                <button
                    onClick={toggleMenu}
                    className="lg:hidden flex flex-col space-y-1.5 p-2 focus:outline-none"
                >
                    <FontAwesomeIcon icon={faBars} className="w-6 h-6 text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500" />
                </button>
            </div>
    
            {/* Menú desplegable en dispositivos móviles */}
            <div className={`lg:hidden ${menuOpen ? 'block' : 'hidden'} bg-gray-900 shadow-2xl`}>
                <div className="px-4 py-3 space-y-4">
                    <Link href={route('Pag_principal')} className="block text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                        Inicio
                    </Link>
                    <Link href={route('nosotros')} className="block text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                        Nosotros
                    </Link>
    
                    {/* Tienda en móvil */}
                    <ToggleMenu menuItems={menuItemsTienda}>
                        <div className="flex items-center space-x-1 cursor-pointer group">
                            <span className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">Tienda</span>
                            <ChevronDownIcon className="w-4 h-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:via-red-500 group-hover:to-yellow-500 transition duration-500" />
                        </div>
                    </ToggleMenu>
    
                    {/* Servicios en móvil */}
                    <ToggleMenu menuItems={menuItemsServicios}>
                        <div className="flex items-center space-x-1 cursor-pointer group">
                            <span className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">Servicios</span>
                            <ChevronDownIcon className="w-4 h-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:via-red-500 group-hover:to-yellow-500 transition duration-500" />
                        </div>
                    </ToggleMenu>
                  
                            <Link href={route('contacto')} className="block text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                Contacto
                            </Link>
                    
                    {user && (
                        <>
                             {user.role != 'admin' && (
                                <Link href={route('pedidos')} className="block text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                    Pedidos
                                </Link>
                            )}
                            {user.role === 'admin' && (
                                <>
                                    <Link href={route('mostrar.productos')} className="block text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                        Productos
                                    </Link>
                                    <Link href={route('asignar.taquilla.mostrar')} className="block text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                         Taquilla
                                    </Link>

                                    <Link href={route('gestor.pedidos')} className="block text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                        Gestor pedidos 
                                    </Link>
                                </>
                            )}
                             {user.role != 'admin' && (
                                    <Link href={route('carrito')} className="flex items-center text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 transition duration-500">
                                        <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                                        Carrito
                                        {cartCount > 0 && (
                                            <span className="ml-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-xs rounded-full px-2 py-1">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
    
                            {/* Solo para admin en móvil */}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
    
};

export default Menu_Principal;