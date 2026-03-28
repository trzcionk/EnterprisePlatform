import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {
        target: process.env.VITE_AUTH_API_URL || 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/api/processor': {
        target: process.env.VITE_PROCESSOR_API_URL || 'http://127.0.0.1:5002',
        changeOrigin: true,
      },
      '/api/gateway': {
        target: process.env.VITE_GATEWAY_API_URL || 'http://127.0.0.1:5003',
        changeOrigin: true,
      },
      '/api/products': {
        target: process.env.VITE_PRODUCT_API_URL || 'http://127.0.0.1:5004',
        changeOrigin: true,
      },
      '/api': {
        target: process.env.API_URL || 'http://127.0.0.1:5004',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
