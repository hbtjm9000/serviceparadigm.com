<template>
  <div>
    <!-- Already verified — redirect to calendar -->
    <div v-if="verified" class="text-center py-12">
      <p class="font-body text-lg text-on-surface-variant mb-6">You're already on the list. Taking you to the calendar...</p>
      <a :href="calendarUrl" class="inline-block bg-primary text-on-primary font-label uppercase tracking-widest text-sm px-8 py-4 hover:bg-secondary transition-colors">
        Open Calendar
      </a>
    </div>

    <!-- Verification check in progress -->
    <div v-else-if="checking" class="text-center py-12">
      <p class="font-body text-on-surface-variant">Checking...</p>
    </div>

    <!-- Show form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6 max-w-lg mx-auto">
      <div>
        <label for="bg-name" class="block font-label text-xs tracking-[0.1em] text-on-surface-variant uppercase mb-2">Name <span class="text-error">*</span></label>
        <input id="bg-name" v-model="form.name" type="text" required class="input-underline w-full" placeholder="Your full name" />
      </div>

      <div>
        <label for="bg-email" class="block font-label text-xs tracking-[0.1em] text-on-surface-variant uppercase mb-2">Email <span class="text-error">*</span></label>
        <input id="bg-email" v-model="form.email" type="email" required class="input-underline w-full" placeholder="you@company.com" />
      </div>

      <div>
        <label for="bg-company" class="block font-label text-xs tracking-[0.1em] text-on-surface-variant uppercase mb-2">Company</label>
        <input id="bg-company" v-model="form.company" type="text" class="input-underline w-full" placeholder="Company name" />
      </div>

      <!-- Hidden interest field pre-filled from URL -->
      <input type="hidden" v-model="form.interest" />

      <div v-if="error" class="p-4 bg-surface-container-low">
        <p class="text-error font-label text-sm">{{ error }}</p>
      </div>

      <button type="submit" :disabled="isSubmitting" class="btn-primary w-full justify-center mt-4" :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }">
        {{ isSubmitting ? 'SUBMITTING...' : 'BOOK A MEETING' }}
      </button>

      <p class="font-body text-xs text-on-surface-variant text-center mt-4">
        No spam. We'll use your details to prepare for our conversation.
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getCampaignParams } from '../lib/analytics'

const CALENDAR_URL = 'https://calendar.app.google/teRByg9wRAUZSYww5'
const STORAGE_KEY = 'sp:booking_verified'
const calendarUrl = ref(CALENDAR_URL)

const verified = ref(false)
const checking = ref(true)
const isSubmitting = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  company: '',
  interest: '',
})

onMounted(() => {
  // Check localStorage for existing verification
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    verified.value = true
    checking.value = false
    return
  }

  // Read ?interest= from URL
  const params = new URLSearchParams(window.location.search)
  const interest = params.get('interest')
  if (interest) form.interest = interest

  checking.value = false
})

const handleSubmit = async () => {
  if (!form.name.trim()) { error.value = 'Name is required'; return }
  if (!form.email.includes('@')) { error.value = 'Valid email required'; return }

  isSubmitting.value = true
  error.value = ''

  try {
    const res = await fetch('/api/appointment-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        company: form.company,
        interest: form.interest,
        ...getCampaignParams(),
        page_url: window.location.href,
      }),
    })

    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'Submission failed')

    // Store verification in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      email: form.email,
      name: form.name,
      verified_at: new Date().toISOString(),
    }))

    // Redirect to Google Calendar
    window.location.href = data.redirect || CALENDAR_URL
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Something went wrong'
    isSubmitting.value = false
  }
}
</script>
