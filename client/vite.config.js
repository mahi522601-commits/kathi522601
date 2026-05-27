import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression(),
    sitemap({
      hostname: 'https://khyathicollections.com',
      dynamicRoutes: [
        '/',
        '/shop',
        '/collections',
        '/about',
        '/contact',
        '/search',
        '/wishlist',
        '/policies',
        '/sarees-in-hyderabad',
        '/sarees-in-bangalore',
        '/sarees-in-andhra-pradesh',
        '/sarees-in-vijayawada',
        '/sarees-in-guntur',
        '/sarees-in-ongole',
        '/jewellery',
      ],
      exclude: [
        '/admin',
        '/admin/*',
        '/login',
        '/register',
        '/account',
        '/checkout',
        '/cart',
        '/order-confirmation',
        '/receipt/*',
        '/track-order/*',
      ],
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
