/**
 * Vue Router configuration for CMS Admin
 * 
 * Add this to your main Astro Vue integration
 */

import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '../components/AdminLayout.vue';

const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/admin/experiments',
      },
      {
        path: 'experiments',
        component: () => import('../pages/experiments/index.vue'),
      },
      {
        path: 'experiments/:key',
        component: () => import('../pages/experiments/[key].vue'),
      },
      {
        path: 'content',
        component: () => import('../pages/content/variants.vue'),
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
