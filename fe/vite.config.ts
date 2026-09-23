import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In sviluppo /api lo inoltra Vite al backend sulla 8080 (niente CORS).
    // In produzione il sito statico e' un altro dominio: serve VITE_API_URL.
    proxy: {
      '/api': { target: 'http://localhost:8080' },
    },
  },
})
