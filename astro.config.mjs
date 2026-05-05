import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://serviceparadigm.com',
  server: {
    host: '127.0.0.1', // loopback only — no external exposure
  },
  integrations: [
    vue({
      experimental: {
        clientSideRouting: true,
      },
    }),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
