import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const js = require('@eslint/js');
const globals = require('globals');
const astro = require('eslint-plugin-astro');
const vuePlugin = require('eslint-plugin-vue');
const tseslint = require('@typescript-eslint/parser');
const tseslintPlugin = require('@typescript-eslint/eslint-plugin');
const astroParser = require('astro-eslint-parser');
const vueParser = require('vue-eslint-parser');
const vueFlatRecommended = require('eslint-plugin-vue/dist/configs/flat/vue3-recommended.js');

const vueRecommendedRules = vueFlatRecommended[0]?.rules ?? {};

export default [
  {
    ignores: [
      'dist/**', 'node_modules/**', '.astro/**',
      'coverage/**', 'playwright-report/**', 'tests/**',
    ],
  },
  // Base JS
  {
    files: ['**/*.js', '**/*.mjs'],
    rules: { ...js.configs.recommended.rules },
  },
  // TypeScript (non-Vue/Astro)
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tseslintPlugin },
    languageOptions: { parser: tseslint },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Astro
  {
    files: ['**/*.astro'],
    plugins: { astro },
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tseslint,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      ...astro.configs.recommended.rules,
      'astro/no-set-html-directive': 'off',
      'astro/no-deprecated-astro-fetchcontent': 'off',
    },
  },
  // Vue
  {
    files: ['**/*.vue'],
    plugins: { vue: vuePlugin },
    languageOptions: {
      parser: vueParser,
      globals: { ...globals.browser },
    },
    rules: {
      ...vueRecommendedRules,
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': 'off',
    },
  },
];
