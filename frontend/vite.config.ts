import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
/// <reference types="vitest" />

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
    host: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});