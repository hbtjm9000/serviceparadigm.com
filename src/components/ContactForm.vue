<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Name -->
    <div>
      <label for="name" class="block font-label text-xs tracking-[0.1em] text-on-surface-variant uppercase mb-2">
        Name <span class="text-error">*</span>
      </label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        required
        class="input-underline"
        placeholder="Your full name"
      />
    </div>

    <!-- Email -->
    <div>
      <label for="email" class="block font-label text-xs tracking-[0.1em] text-on-surface-variant uppercase mb-2">
        Email <span class="text-error">*</span>
      </label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        required
        class="input-underline"
        placeholder="you@company.com"
      />
    </div>

    <!-- Company -->
    <div>
      <label for="company" class="block font-label text-xs tracking-[0.1em] text-on-surface-variant uppercase mb-2">
        Company
      </label>
      <input
        id="company"
        v-model="form.company"
        type="text"
        class="input-underline"
        placeholder="Company name"
      />
    </div>

    <!-- Service Interest -->
    <div>
      <label for="service" class="block font-label text-xs tracking-[0.1em] text-on-surface-variant uppercase mb-2">
        Service Interest
      </label>
      <select
        id="service"
        v-model="form.service"
        class="input-underline"
      >
        <option value="" disabled>Select a service</option>
        <option value="ai-strategy">AI Strategy & Implementation</option>
        <option value="solutions-architecture">Solutions Architecture</option>
        <option value="cybersecurity">Cybersecurity Architecture</option>
        <option value="digital-presence">Digital Presence</option>
        <option value="other">Other</option>
      </select>
    </div>

    <!-- Message -->
    <div>
      <label for="message" class="block font-label text-xs tracking-[0.1em] text-on-surface-variant uppercase mb-2">
        Message <span class="text-error">*</span>
      </label>
      <textarea
        id="message"
        v-model="form.message"
        required
        class="input-underline"
        rows="4"
        placeholder="Tell us about your project..."
      ></textarea>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      class="btn-primary w-full justify-center mt-4"
      :disabled="isSubmitting"
    >
      {{ isSubmitting ? 'SENDING...' : 'SEND MESSAGE' }}
    </button>

    <!-- Success Message -->
    <div v-if="submitted" class="p-4 bg-surface-container-low">
      <p class="text-secondary font-label text-sm">
        ✓ Thank you. We'll be in touch within 24 hours.
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-4 bg-surface-container-low">
      <p class="text-error font-label text-sm">
        {{ error }}
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// Get current experiment variant from localStorage
function getHeroVariant(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('exp:hero-copy-test') || 'unknown';
  }
  return 'unknown';
}

// Log conversion to console and GA4
function logConversion(variant: string): void {
  console.log(`[Conversion] hero-copy-test: ${variant} → form_submitted`);
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_submitted', {
      experiment_id: 'hero-copy-test',
      variation_id: variant,
      page_location: window.location.href,
    });
  }
}

const form = reactive({
  name: '',
  email: '',
  company: '',
  service: '',
  message: ''
});

const isSubmitting = ref(false);
const submitted = ref(false);
const error = ref('');

// Form submission endpoint - Google Apps Script Web App
// Reads from PUBLIC_FORM_ENDPOINT env var at build time (set via wrangler.toml or CI),
// falls back to the hardcoded URL for local dev.
const FORM_ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT || 'https://script.google.com/macros/s/AKfycbzlnvrJOb4pQDjOegA6GIqUZ3NmEm8zH3xWZrlreVTGgAdjxukNByPxrAR42Y1WU0HL/exec';

const handleSubmit = async () => {
  isSubmitting.value = true;
  error.value = '';

  try {
    if (FORM_ENDPOINT) {
      // Real API call to Google Apps Script
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          service: form.service,
          message: form.message
        })
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }
    } else {
      // Fallback: simulate (remove after real endpoint configured)
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Reset form
    form.name = '';
    form.email = '';
    form.company = '';
    form.service = '';
    form.message = '';
    
    submitted.value = true;
    
    // Log conversion with experiment variant
    const variant = getHeroVariant();
    logConversion(variant);
    
    // Hide success message after 10 seconds
    setTimeout(() => {
      submitted.value = false;
    }, 10000);
  } catch (e) {
    error.value = 'Something went wrong. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Fix for select dropdown styling */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23191c1d'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0 center;
  background-size: 1.5rem;
  padding-right: 2rem;
}

/* Remove textarea resize handle */
textarea {
  resize: none;
}

/* Input focus states */
input:focus::placeholder,
textarea:focus::placeholder {
  opacity: 0.5;
}
</style>
