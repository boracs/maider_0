// Importamos los estilos y configuraciones iniciales
import "../css/app.css";
import "./bootstrap";

// Importamos Inertia y React
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

// Obtenemos el nombre de la app desde las variables de entorno
const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// Función que devuelve el layout según la página
function getDefaultLayout(pageName) {
    if (pageName.startsWith("Public/")) {
        return (page) => <PublicLayout>{page}</PublicLayout>;
    }

    if (pageName.startsWith("Admin/")) {
        return (page) => <AdminLayout>{page}</AdminLayout>;
    }

    return undefined; // Si no coincide, no usamos layout
}

// Creamos la aplicación Inertia
createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });

        // Obtenemos el módulo
        const module = pages[`./Pages/${name}.jsx`];

        if (!module) {
            throw new Error(`No se encontró la página: ${name}`);
        }

        // Obtenemos el componente real
        let page = module.default;

        // Le asignamos layout dinámico si aplica
        page.layout = getDefaultLayout(name);

        return page;
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    progress: false,
});