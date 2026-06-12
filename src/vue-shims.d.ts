/// <reference types="vitest/globals" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

// Vite/Astro environment variables
interface ImportMetaEnv {
  readonly PUBLIC_GROWTHBOOK_API_HOST: string;
  readonly PUBLIC_GROWTHBOOK_CLIENT_KEY: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Google Analytics gtag
interface Window {
  gtag?: (command: string, eventName: string, eventParams?: Record<string, unknown>) => void;
  __featureFlags?: { getFlag: (key: string, defaultValue: string) => string };
}
