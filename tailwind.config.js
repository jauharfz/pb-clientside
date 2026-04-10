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
            colors: {
                green: {
                    50:  '#f8faf8',  // app background tint  (umkm: #f8faf8)
                    100: '#dfeee6',  // lightest panel tint   (umkm: #dfeee6)
                    200: '#c3dece',  // soft border/divider   (umkm: #c3dece)
                    300: '#b7d7c4',  // hover bg light        (umkm: #b7d7c4)
                    400: '#6aab82',  // muted accent          (umkm: #6aab82)
                    500: '#4a9b6e',  // medium accent         (umkm: #4a9b6e)
                    600: '#2f855a',  // secondary/hover       (umkm: #2f855a, 37x)
                    700: '#2f6f4e',  // PRIMARY brand green   (umkm: #2f6f4e, 85x)
                    800: '#245840',  // dark variant          (umkm: #245840)
                    900: '#1a3a2a',  // dark heading/text     (umkm: #1a3a2a)
                    950: '#0e1f15',  // deepest shadow        
                },
            },
        },
    },
    plugins: [],
}
