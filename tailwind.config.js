/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./App.tsx",
        "./components/**/*.{ts,tsx}",
        "./pages/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#0F172A',        // Slate 900 - Deep Navy Blue (Modern Enterprise)
                'primary-hover': '#1E293B', // Slate 800
                accent: '#3B82F6',         // Blue 500 - Electric Blue for CTAs
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
