<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Subscribers</h2>
        <p class="text-sm text-gray-500 mt-1">Newsletter and booking subscribers</p>
      </div>
      <a
        :href="`/api/admin/subscribers/export`"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        CSV Export
      </a>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow border border-gray-200 p-4">
        <p class="text-sm text-gray-500">Total</p>
        <p class="text-2xl font-bold text-gray-900">{{ summary.total }}</p>
      </div>
      <div class="bg-white rounded-lg shadow border border-gray-200 p-4">
        <p class="text-sm text-gray-500">Active</p>
        <p class="text-2xl font-bold text-green-600">{{ summary.active }}</p>
      </div>
      <div class="bg-white rounded-lg shadow border border-gray-200 p-4">
        <p class="text-sm text-gray-500">Newsletter</p>
        <p class="text-2xl font-bold text-blue-600">{{ summary.newsletter }}</p>
      </div>
      <div class="bg-white rounded-lg shadow border border-gray-200 p-4">
        <p class="text-sm text-gray-500">Booking</p>
        <p class="text-2xl font-bold text-purple-600">{{ summary.booking }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="s in subscribers" :key="s.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ s.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ s.name || '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="sourceClass(s.source)"
              >{{ s.source }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >{{ s.status }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(s.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Subscriber {
  id: number
  email: string
  name?: string
  source: string
  status: string
  created_at: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const subscribers = ref<Subscriber[]>([])

const summary = computed(() => {
  const total = subscribers.value.length
  const active = subscribers.value.filter(s => s.status === 'active').length
  const newsletter = subscribers.value.filter(s => s.source === 'newsletter' || s.source === 'both').length
  const booking = subscribers.value.filter(s => s.source === 'booking' || s.source === 'both').length
  return { total, active, newsletter, booking }
})

function sourceClass(source?: string) {
  switch (source) {
    case 'newsletter': return 'bg-blue-100 text-blue-800'
    case 'booking': return 'bg-purple-100 text-purple-800'
    case 'both': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadSubscribers() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/api/admin/subscribers')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    subscribers.value = data.subscribers || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load subscribers'
  } finally {
    loading.value = false
  }
}

onMounted(loadSubscribers)
</script>
