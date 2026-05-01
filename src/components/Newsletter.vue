<template>
  <section class="bg-primary py-24 text-white overflow-hidden relative">
    <div class="max-w-3xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
      <!-- Headline -->
      <h2 class="font-serif text-5xl lg:text-7xl text-white font-black mb-8">
        Join the Network.
      </h2>

      <!-- Description -->
      <p class="font-body text-primary-fixed max-w-2xl mb-12 text-lg leading-relaxed">
        Receive technical briefs, white papers, and event invitations directly in your secure terminal.
      </p>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="flex flex-col md:flex-row gap-0 w-full max-w-xl">
        <div class="flex-1 relative">
          <label for="newsletter-email" class="sr-only">Email address</label>
          <input
            id="newsletter-email"
            v-model="email"
            type="email"
            placeholder="ENCRYPTED EMAIL ADDRESS"
            required
            class="w-full bg-white/10 border-0 focus:ring-0 text-white font-body placeholder:text-white/40 px-6 py-4"
          />
        </div>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-slate-900 hover:bg-black text-white px-10 py-4 font-body font-bold uppercase tracking-widest text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'SUBMITTING...' : 'SUBMIT' }}
        </button>
      </form>
    </div>

    <!-- Decorative background text -->
    <div class="absolute -bottom-10 -right-20 text-[20rem] font-black text-white/5 font-serif pointer-events-none select-none" aria-hidden="true">
      LEDGER
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Newsletter endpoint - Google Apps Script Web App
const NEWSLETTER_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzeIqCSz4HNpY7SXsXywVRwY8DNubVA-Xw2zR8w0ZO3FyMfNhunUDhyG90mujCYb82f/exec';

const email = ref('');
const isSubmitting = ref(false);
const submitted = ref(false);

const handleSubmit = async () => {
  if (!email.value || !email.value.includes('@')) return;
  
  isSubmitting.value = true;
  
  try {
    if (NEWSLETTER_ENDPOINT) {
      const response = await fetch(NEWSLETTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value })
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
} else {
      // Fallback: simulate
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    submitted.value = true;
    isSubmitting.value = false;
    email.value = '';
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      submitted.value = false;
    }, 5000);
  } catch (err) {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Custom focus styles for the input */
input:focus::placeholder {
  opacity: 0.6;
}

/* Fix for Safari input styling */
input {
  -webkit-appearance: none;
  border-radius: 0;
}
</style>
