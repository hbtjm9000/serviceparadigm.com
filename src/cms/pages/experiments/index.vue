<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Hero Experiments</h2>
        <p class="text-sm text-gray-500 mt-1">Manage A/B test variants for the homepage hero section</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Variant
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p class="mt-4 text-gray-500">Loading variants...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Failed to load variants</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Variants Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(variant, key) in variants"
        :key="key"
        class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
      >
        <!-- Variant Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ variant.label }}</h3>
              <p class="text-xs text-gray-500 font-mono mt-1">{{ key }}</p>
            </div>
            <span
              v-if="key === currentVariant"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              Active
            </span>
          </div>
        </div>

        <!-- Variant Content -->
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase">Headline</label>
            <p class="mt-1 text-sm text-gray-900">{{ variant.headline }}</p>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase">Highlight</label>
            <p class="mt-1 text-sm text-gray-900">{{ variant.headline_highlight }}</p>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase">CTA</label>
            <p class="mt-1 text-sm text-gray-900">{{ variant.cta_text }}</p>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase">Subheadline</label>
            <p class="mt-1 text-sm text-gray-700 line-clamp-2">{{ variant.subheadline }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between space-x-2">
          <button
            @click="handleEdit(key)"
            class="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            @click="handlePreview(key)"
            class="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            Preview
          </button>
          <button
            @click="handleDelete(key)"
            class="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Create New Variant</h3>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Variant Key</label>
            <input
              v-model="newVariant.key"
              type="text"
              placeholder="v4-your-variant"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Label</label>
            <input
              v-model="newVariant.label"
              type="text"
              placeholder="Descriptive name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Headline</label>
            <input
              v-model="newVariant.headline"
              type="text"
              placeholder="Main headline text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Headline Highlight</label>
            <input
              v-model="newVariant.headline_highlight"
              type="text"
              placeholder="Word to highlight"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">CTA Text</label>
            <input
              v-model="newVariant.cta_text"
              type="text"
              placeholder="Button text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Subheadline</label>
            <textarea
              v-model="newVariant.subheadline"
              rows="3"
              placeholder="Supporting text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="handleCreate"
            :disabled="saving"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Creating...' : 'Create Variant' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ExperimentVariant } from '@/composables/useExperiment';
import { getVariants, createVariant, updateVariant, deleteVariant } from '@/cms/lib/content-api';

const loading = ref(true);
const error = ref<string | null>(null);
const saving = ref(false);
const showCreateModal = ref(false);
const currentVariant = ref<string | null>(null);

const variants = ref<Record<string, ExperimentVariant>>({});

const newVariant = ref({
  key: '',
  label: '',
  headline: '',
  headline_highlight: '',
  cta_text: '',
  subheadline: '',
});

// Load variants on mount
onMounted(async () => {
  await loadVariants();
  
  // Get current variant from localStorage
  if (typeof localStorage !== 'undefined') {
    currentVariant.value = localStorage.getItem('experiment_hero_variant');
  }
});

async function loadVariants() {
  loading.value = true;
  error.value = null;
  
  try {
    variants.value = await getVariants('hero');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load variants';
  } finally {
    loading.value = false;
  }
}

function handleEdit(key: string) {
  // Navigate to edit page using direct URL
  window.location.href = `/admin/experiments/${encodeURIComponent(key)}`;
}

function handlePreview(key: string) {
  // Set variant in localStorage and reload
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('experiment_hero_variant', key);
    window.location.href = '/';
  }
}

async function handleDelete(key: string) {
  if (!confirm(`Are you sure you want to delete variant "${key}"? This cannot be undone.`)) {
    return;
  }

  saving.value = true;
  
  try {
    const result = await deleteVariant('hero', key);
    
    if (result.success) {
      await loadVariants();
    } else {
      alert(`Failed to delete: ${result.error}`);
    }
  } catch (err) {
    alert('Failed to delete variant');
  } finally {
    saving.value = false;
  }
}

async function handleCreate() {
  if (!newVariant.value.key || !newVariant.value.label || !newVariant.value.headline) {
    alert('Please fill in all required fields');
    return;
  }

  saving.value = true;
  
  try {
    const result = await createVariant('hero', newVariant.value.key, {
      label: newVariant.value.label,
      headline: newVariant.value.headline,
      headline_highlight: newVariant.value.headline_highlight,
      cta_text: newVariant.value.cta_text,
      subheadline: newVariant.value.subheadline,
    });
    
    if (result.success) {
      showCreateModal.value = false;
      await loadVariants();
      newVariant.value = {
        key: '',
        label: '',
        headline: '',
        headline_highlight: '',
        cta_text: '',
        subheadline: '',
      };
    } else {
      alert(`Failed to create: ${result.error}`);
    }
  } catch (err) {
    alert('Failed to create variant');
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
