<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Appointment Requests</h2>
        <p class="text-sm text-gray-500 mt-1">Manage incoming booking enquiries</p>
      </div>
      <a
        :href="`/api/admin/appointment-requests/export`"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        CSV Export
      </a>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p class="mt-4 text-gray-500">Loading appointments...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="appointments.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No appointments yet</h3>
      <p class="mt-2 text-sm text-gray-500">Incoming booking requests will appear here.</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="a in appointments" :key="a.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ a.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ a.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ a.company || '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ a.interest || '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="statusClass(a.status)"
              >{{ a.status }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(a.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                v-if="a.status !== 'completed' && a.status !== 'cancelled'"
                @click="updateStatus(a, 'completed')"
                class="text-green-600 hover:text-green-800 mr-3"
              >Complete</button>
              <button
                v-if="a.status !== 'cancelled'"
                @click="updateStatus(a, 'cancelled')"
                class="text-red-600 hover:text-red-800"
              >Cancel</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Appointment {
  id: number
  email: string
  name: string
  company?: string
  interest?: string
  source: string
  status: string
  created_at: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const appointments = ref<Appointment[]>([])

function statusClass(status?: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'verified': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadAppointments() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/api/admin/appointment-requests')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    appointments.value = data.appointments || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load appointments'
  } finally {
    loading.value = false
  }
}

async function updateStatus(a: Appointment, status: string) {
  try {
    const res = await fetch(`/api/admin/appointment-requests/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.ok) {
      await loadAppointments()
    } else {
      alert(data.error || 'Failed to update status')
    }
  } catch {
    alert('Failed to update status')
  }
}

onMounted(loadAppointments)
</script>
