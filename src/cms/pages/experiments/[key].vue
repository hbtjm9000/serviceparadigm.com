<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <nav class="flex items-center text-sm text-gray-500">
          <a href="/admin/experiments" class="hover:text-gray-700">Experiments</a>
          <svg class="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-gray-900 font-medium">{{ variantKey }}</span>
        </nav>
        <h2 class="text-2xl font-bold text-gray-900 mt-2">Edit Variant</h2>
      </div>
      <div class="flex space-x-3">
        <button
          @click="handlePreview"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Preview
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p class="mt-4 text-gray-500">Loading variant...</p>
    </div>

    <!-- Edit Form -->
    <div v-else class="grid gap-8 lg:grid-cols-2">
      <!-- Editor Panel -->
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Variant Details</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Variant Key</label>
              <input
                v-model="variant.key"
                type="text"
                disabled
                class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Label
                <span class="text-gray-500 font-normal ml-1">(Internal name)</span>
              </label>
              <input
                v-model="variant.label"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Headline
                <span class="text-gray-500 font-normal ml-1">(Main hero text)</span>
              </label>
              <input
                v-model="variant.headline"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Headline Highlight
                <span class="text-gray-500 font-normal ml-1">(Emphasized word)</span>
              </label>
              <input
                v-model="variant.headline_highlight"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                CTA Text
                <span class="text-gray-500 font-normal ml-1">(Button label)</span>
              </label>
              <input
                v-model="variant.cta_text"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Subheadline
                <span class="text-gray-500 font-normal ml-1">(Supporting description)</span>
              </label>
              <textarea
                v-model="variant.subheadline"
                rows="4"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
          
          <!-- Hero Preview -->
          <div class="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div class="max-w-2xl mx-auto text-center space-y-6">
              <h1 class="text-4xl font-bold text-gray-900">
                {{ variant.headline.split(variant.headline_highlight)[0] }}
                <span class="text-blue-600">{{ variant.headline_highlight }}</span>
                {{ variant.headline.split(variant.headline_highlight)[1] }}
              </h1>
              
              <p class="text-lg text-gray-600">
                {{ variant.subheadline }}
              </p>
              
              <button class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                {{ variant.cta_text }}
              </button>
            </div>
          </div>
          
          <!-- Character Counts -->
          <div class="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div class="bg-gray-50 rounded-md p-3">
              <div class="text-gray-500">Headline</div>
              <div class="font-medium" :class="variant.headline.length > 60 ? 'text-red-600' : 'text-gray-900'">
                {{ variant.headline.length }} / 60 chars
              </div>
            </div>
            <div class="bg-gray-50 rounded-md p-3">
              <div class="text-gray-500">Subheadline</div>
              <div class="font-medium" :class="variant.subheadline.length > 200 ? 'text-red-600' : 'text-gray-900'">
                {{ variant.subheadline.length }} / 200 chars
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { ExperimentVariant } from '@/composables/useExperiment';
import { getVariants, updateVariant } from '@/cms/lib/content-api';

// Get variant key from URL pathname (no Vue Router needed)
const variantKey = computed(() => {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
});

const loading = ref(true);
const saving = ref(false);

const variant = ref({
  key: '',
  label: '',
  headline: '',
  headline_highlight: '',
  cta_text: '',
  subheadline: '',
});

onMounted(async () => {
  loading.value = true;
  
  try {
    const allVariants = await getVariants('hero');
    const currentVariant = allVariants[variantKey.value];
    
    if (!currentVariant) {
      alert('Variant not found');
      window.location.href = '/admin/experiments';
      return;
    }
    
    variant.value = {
      key: variantKey.value,
      ...currentVariant,
    };
  } catch (err) {
    alert('Failed to load variant');
    console.error(err);
  } finally {
    loading.value = false;
  }
});

async function handleSave() {
  saving.value = true;
  
  try {
    const result = await updateVariant('hero', variantKey.value, {
      label: variant.value.label,
      headline: variant.value.headline,
      headline_highlight: variant.value.headline_highlight,
      cta_text: variant.value.cta_text,
      subheadline: variant.value.subheadline,
    });
    
    if (result.success) {
      alert('Variant saved successfully!');
    } else {
      alert(`Failed to save: ${result.error}`);
    }
  } catch (err) {
    alert('Failed to save variant');
    console.error(err);
  } finally {
    saving.value = false;
  }
}

function handlePreview() {
  // Set variant in localStorage and open in new tab
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('experiment_hero_variant', variantKey.value);
    window.open('/', '_blank');
  }
}
</script>
