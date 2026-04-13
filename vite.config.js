import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server:  { port: 5173 },
  preview: { port: 5173 },
  optimizeDeps: {
    // Prevents Vite from pre-bundling lucide-react, which causes
    // "Could not resolve ./icons/glass-water.js" on Windows
    exclude: ['lucide-react'],
  },
})
