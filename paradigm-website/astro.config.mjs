import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://serviceparadigm.com',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },
  build: {
    format: 'directory',
    assets: '_astro',
  },
  vite: {
    build: {
      cssMinify: true,
    },
    assetsInclude: ['**/*.svg'],
  },
});
