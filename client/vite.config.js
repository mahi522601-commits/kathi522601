import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression(),
  ],

  server: {
    port: 5173,
  },

  build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],

          firebase: [
            'firebase/app',
            'firebase/auth',
          ],

          motion: ['framer-motion'],

          ui: [
            'lucide-react',
            'react-dropzone',
          ],

          swiper: [
            'swiper',
            'swiper/react',
            'swiper/modules',
          ],
        },
      },
    },
  },
});