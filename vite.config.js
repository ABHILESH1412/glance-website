import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  // '/' by default; the GitHub Pages workflow sets BASE_PATH to '/<repo>/'.
  base: process.env.BASE_PATH || '/',
  plugins: [solid()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap';
        },
      },
    },
  },
});
