import "../css/app.css";
import "./bootstrap";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";


const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// Función para obtener el layout según la ruta
function getDefaultLayout(page) {
    if (page.startsWith("Public/")) {
        return (page) => <PublicLayout>{page}</PublicLayout>;
    }

    if (page.startsWith("Admin/")) {
        return (page) => <AdminLayout>{page}</AdminLayout>;
    }

    return undefined; // Si no coincide, no se asigna un layout específico
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });

        // Asignar el layout a cada página según su ruta
        let page = pages[`./Pages/${name}.jsx`];
        page.default.layout = getDefaultLayout(name); // Asignar el layout dinámico
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: false, // Puedes habilitar el progreso si lo necesitas
});