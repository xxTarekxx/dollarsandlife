import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure this matches the root of your deployment
  build: {
    outDir: 'build', // Ensure this matches the build output directory
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-router-dom', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 4173,
  },
});
