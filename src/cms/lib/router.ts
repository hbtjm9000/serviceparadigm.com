/**
 * Vue Router configuration for CMS Admin
 * 
 * Hash-based history for static hosting compatibility.
 * Prefix: /internala for obscurity.
 */

import { createRouter, createWebHashHistory } from 'vue-router';
import AdminLayout from '../components/AdminLayout.vue';

const routes = [
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        component: () => import('../pages/dashboard/index.vue'),
      },
      {
        path: 'content',
        component: () => import('../pages/content/articles.vue'),
      },
      {
        path: 'appointments',
        component: () => import('../pages/appointments/index.vue'),
      },
      {
        path: 'subscribers',
        component: () => import('../pages/subscribers/index.vue'),
      },
      {
        path: 'experiments',
        component: () => import('../pages/experiments/index.vue'),
      },
      {
        path: 'experiments/:key',
        component: () => import('../pages/experiments/[key].vue'),
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHashHistory('/internala/'),
  routes,
});
