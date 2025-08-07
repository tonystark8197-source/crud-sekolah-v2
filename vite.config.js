import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deteksi apakah sedang build untuk production (GitHub Pages)
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  base: isProduction ? '/sekolah' : '/', // ganti 'frontend' sesuai nama repo kamu
  server: {
    port: 5173,
    strictPort: true,
    proxy: !isProduction
      ? {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false
          },
          '/uploads': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path
          }
        }
      : undefined
  }
});
