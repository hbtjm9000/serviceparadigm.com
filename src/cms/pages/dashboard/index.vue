<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p class="text-sm text-gray-500 mt-1">Overview of your site</p>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <router-link to="/content" class="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Articles</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.articles }}</p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-400">
          {{ stats.published }} published, {{ stats.drafts }} drafts
        </p>
      </router-link>

      <router-link to="/appointments" class="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Appointments</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.appointments }}</p>
          </div>
          <div class="bg-yellow-100 rounded-full p-3">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <p class="mt-2 text-xs text-yellow-600">
          {{ stats.pendingAppointments }} pending
        </p>
      </router-link>

      <router-link to="/subscribers" class="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Subscribers</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.subscribers }}</p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-400">
          {{ stats.activeSubscribers }} active
        </p>
      </router-link>

      <router-link to="/experiments" class="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Experiments</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.experiments }}</p>
          </div>
          <div class="bg-purple-100 rounded-full p-3">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Quick actions -->
    <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link to="/content" class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
          <svg class="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="text-sm font-medium text-gray-700">New Article</span>
        </router-link>
        <a href="/admin/newsletter" class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
          <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span class="text-sm font-medium text-gray-700">Broadcast Email</span>
        </a>
        <a href="/api/admin/subscribers/export" class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
          <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm font-medium text-gray-700">Export Subscribers</span>
        </a>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <p class="text-sm text-gray-400">Loading stats...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)
const stats = ref({
  articles: 0,
  published: 0,
  drafts: 0,
  appointments: 0,
  pendingAppointments: 0,
  subscribers: 0,
  activeSubscribers: 0,
  experiments: 0,
})

async function loadStats() {
  try {
    const [articlesRes, appointmentsRes, subscribersRes] = await Promise.all([
      fetch('/api/admin/articles'),
      fetch('/api/admin/appointment-requests'),
      fetch('/api/admin/subscribers'),
    ])

    if (articlesRes.ok) {
      const data = await articlesRes.json()
      const articles = data.articles || []
      stats.value.articles = articles.length
      stats.value.published = articles.filter(a => a.status === 'published').length
      stats.value.drafts = articles.filter(a => a.status === 'draft').length
    }

    if (appointmentsRes.ok) {
      const data = await appointmentsRes.json()
      const appointments = data.appointments || []
      stats.value.appointments = appointments.length
      stats.value.pendingAppointments = appointments.filter(a => a.status === 'pending').length
    }

    if (subscribersRes.ok) {
      const data = await subscribersRes.json()
      const subscribers = data.subscribers || []
      stats.value.subscribers = subscribers.length
      stats.value.activeSubscribers = subscribers.filter(s => s.status === 'active').length
    }
  } catch {
    // Silent fail — cards show 0
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>
