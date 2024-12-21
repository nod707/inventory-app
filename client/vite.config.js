import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          tensorflow: ['@tensorflow/tfjs']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@tensorflow/tfjs']
  },
  server: {
    port: 3000
  }
})
