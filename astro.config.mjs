import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://serviceparadigm.com',
  compressHTML: true,
  server: {
    host: '127.0.0.1',
    allowedHosts: ['serviceparadigm.test'],
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
    resolve: {
      conditions: ['web', 'browser'],
    },
  },
});
