<template>
  <section class="bg-tertiary py-20 lg:py-24">
    <div class="max-w-3xl mx-auto px-6 lg:px-8 text-center">
      <!-- Headline -->
      <h2 class="font-serif text-4xl lg:text-5xl text-white italic leading-[1.1]">
        Join the Network.
      </h2>
      
      <!-- Description -->
      <p class="font-body text-white/70 mt-6 max-w-xl mx-auto leading-relaxed">
        Receive technical briefs, white papers, and event invitations directly in your 
        secure terminal.
      </p>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="mt-10 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
        <div class="flex-1 relative">
          <label for="newsletter-email" class="sr-only">Email address</label>
          <input 
            id="newsletter-email"
            v-model="email"
            type="email" 
            placeholder="ENCRYPTED EMAIL ADDRESS"
            required
            class="w-full bg-transparent border-b-2 border-white/30 text-white placeholder:text-white/40 py-3 px-0 font-sans text-sm tracking-wider focus:outline-none focus:border-secondary-fixed-dim transition-colors"
          />
        </div>
        <button 
          type="submit"
          :disabled="isSubmitting"
          class="bg-secondary text-on-secondary font-sans text-sm px-8 py-3 hover:bg-secondary-fixed-dim hover:text-tertiary transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'SUBMITTING...' : 'SUBMIT' }}
        </button>
      </form>

      <!-- Success Message -->
      <p v-if="submitted" class="mt-6 text-secondary-fixed-dim font-sans text-sm tracking-wide">
        ✓ Successfully connected to the network.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Newsletter endpoint - set after deploying Apps Script Web App
const NEWSLETTER_ENDPOINT = ''; // e.g. 'https://script.google.com/macros/s/.../exec'

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
