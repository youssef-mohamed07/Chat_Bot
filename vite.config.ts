import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/support': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/tickets': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/platforms': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/whatsapp': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

