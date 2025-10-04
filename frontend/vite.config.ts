import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4200,
    host: true,
    proxy: {
      '/login': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path: string) => path
      },
      '/customer': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path: string) => path
      },
      '/order': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path: string) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});