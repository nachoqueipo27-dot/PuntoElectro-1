/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary: Steel Blue
                primary: {
                    DEFAULT: '#31487A',
                    dark: '#243659',
                    light: '#4A6AA0',
                    50: '#E8EDF5',
                    100: '#C5D0E4',
                    200: '#9EB2D0',
                    300: '#7794BC',
                    400: '#5A7DAD',
                    500: '#31487A',
                    600: '#2A3E6A',
                    700: '#233359',
                    800: '#1C2948',
                    900: '#151F38',
                },
                // Accent: Lima Green
                accent: {
                    DEFAULT: '#C9E18D',
                    dark: '#A8C56A',
                    light: '#D9EDB0',
                    50: '#F5F9E8',
                    100: '#E8F2CB',
                    200: '#D9EAAB',
                    300: '#C9E18D',
                    400: '#B5D46A',
                    500: '#A1C74A',
                    600: '#8AB33C',
                    700: '#739D2F',
                    800: '#5C8723',
                    900: '#456618',
                },
                // Semantic colors
                success: '#22C55E',
                warning: '#F59E0B',
                danger: '#EF4444',
            },
            fontFamily: {
                heading: ['Cardo', 'serif'],
                body: ['Didact Gothic', 'sans-serif'],
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },
        },
    },
    plugins: [],
}
