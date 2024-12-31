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
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://tfhub.dev;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: blob:;
        connect-src 'self' https://*.vercel.app https://*.posherdashboard.com https://cdn.jsdelivr.net https://tfhub.dev https://storage.googleapis.com;
        worker-src 'self' blob:;
        child-src 'self' blob:;
        frame-src 'self' https://tfhub.dev;
        wasm-src 'self' https://cdn.jsdelivr.net;
        wasm-unsafe-eval 'self'
      `.replace(/\s+/g, ' ').trim()
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
