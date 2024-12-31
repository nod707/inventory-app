import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@techstark/opencv-js']
  },
  build: {
    commonjsOptions: {
      include: [/@techstark\/opencv-js/, /node_modules/]
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; worker-src 'self' blob:; connect-src 'self' ws: wss:; frame-src 'self';"
    }
  }
});
