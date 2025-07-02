import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        // Archivos JSX y TSX de React
        './resources/js/**/*.jsx',  // Si usas JSX
        './resources/js/**/*.tsx',  // Si usas TSX (opcional)
    ],

    theme: {
        extend: {
            // Extendemos la configuración de las fuentes
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [
        // Plugin de formularios para mejorar los estilos de formularios
        forms,
    ],
};