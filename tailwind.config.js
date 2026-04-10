/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                serif: ['Lora', 'Georgia', 'serif'],
                dm: ['DM Sans', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
