import { useState } from "react";
import { Link } from "@inertiajs/react";

function ToggleMenu({ children, menuItems }) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
        >
            {children}

            {showMenu && (
                <div
                    className="absolute left-[40px] top-full w-52 bg-gray-900 text-white rounded-xl shadow-2xl p-2 z-50 ring-1 ring-gray-700 transition-all duration-300"
                    onMouseEnter={() => setShowMenu(true)}
                    onMouseLeave={() => setShowMenu(false)}
                >
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={route(item.href)}
                            className="block px-4 py-2 rounded-lg transition-colors duration-300
                                       hover:text-transparent hover:bg-clip-text
                                       hover:bg-gradient-to-r hover:from-pink-500
                                       hover:via-red-500 hover:to-yellow-500"
                        >
                            {item.label}
                        </Link>
                    ))}
                    {/* Separador fino */}
                    <div className="border-t border-gray-700 mt-2"></div>
                </div>
            )}
        </div>
    );
}

export default ToggleMenu;
