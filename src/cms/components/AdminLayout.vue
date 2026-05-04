<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Paradigm CMS</h1>
            <nav class="flex space-x-4">
              <a 
                href="/admin/experiments" 
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="currentRoute === 'experiments' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'"
              >
                Experiments
              </a>
              <a 
                href="/admin/content" 
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="currentRoute === 'content' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'"
              >
                Content
              </a>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">serviceparadigm.com</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const currentRoute = computed(() => {
  if (route.path.startsWith('/admin/experiments')) return 'experiments';
  if (route.path.startsWith('/admin/content')) return 'content';
  return 'unknown';
});
</script>
