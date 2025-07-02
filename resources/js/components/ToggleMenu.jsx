import { useState } from 'react';
import { Link } from '@inertiajs/react';  // Usamos Inertia.Link

function ToggleMenu({ children, menuItems }) {
  const [showMenu, setShowMenu] = useState(false);  // useState para controlar si se muestra el submenú

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowMenu(true)}  // Mantenemos el submenú abierto cuando el ratón entra en el menú principal
      onMouseLeave={() => setShowMenu(false)} // Cerramos el submenú cuando el ratón sale del menú principal
    >
      {children}

      {showMenu && (
        <div
          className="absolute left-0 top-full bg-white text-gray-800 rounded-lg shadow-lg  p-2 w-48 z-50"
          onMouseEnter={() => setShowMenu(true)}  // Mantenemos el submenú abierto cuando el ratón entra en el submenú
          onMouseLeave={() => setShowMenu(false)} // Cerramos el submenú cuando el ratón sale del submenú
        >
          {menuItems.map((item, index) => (
           <Link
              key={index}
              href={route(item.href)} // Usamos `route` para generar la URL
              className="block px-4 py-2 hover:text-red-500 rounded-lg transition"
          >
              {item.label}
          </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ToggleMenu;