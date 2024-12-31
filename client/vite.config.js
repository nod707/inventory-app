import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      external: ['@techstark/opencv-js'],
      output: {
        globals: {
          '@techstark/opencv-js': 'cv'
        }
      }
    },
    commonjsOptions: {
      include: [/@techstark\/opencv-js/, /node_modules/]
    }
  },
  optimizeDeps: {
    include: ['@techstark/opencv-js']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
