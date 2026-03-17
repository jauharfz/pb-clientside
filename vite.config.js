import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    // Uncomment dan sesuaikan jika deploy ke subdirectory (mis. GitHub Pages):
    // base: '/nama-repo/',

    // Preview server — untuk test build lokal sebelum deploy
    preview: {
        port: 4173,
    },
})