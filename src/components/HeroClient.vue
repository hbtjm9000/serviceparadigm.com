<template>
  <section class="bg-tertiary text-on-tertiary relative overflow-hidden hero">

    <!-- Background text effect -->
    <div class="absolute -bottom-10 -right-20 text-[20rem] font-black text-white/5 font-serif pointer-events-none select-none" aria-hidden="true">
      Paradigm
    </div>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32 relative z-10">
      <!-- Label -->
      <div class="mb-6">
        <span class="font-label text-xs tracking-[0.2em] text-secondary-fixed-dim uppercase">{{ copy.label }}</span>
      </div>

      <!-- Main Headline -->
      <h1 class="font-headline text-5xl md:text-6xl lg:text-7xl text-white leading-[0.9] font-black tracking-tighter mb-12 ink-bleed">
        The Digital
        <br />
        Infrastructure
        <br />
        of <span class="italic text-secondary-fixed-dim">Tomorrow.</span>
      </h1>

      <!-- CTA Button -->
      <div class="flex flex-col md:flex-row gap-8 items-start">
        <a
          href="/contact"
          class="bg-secondary-fixed text-on-secondary-fixed px-10 py-5 font-label font-bold uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 flex items-center gap-4 group"
        >
          Start Your Transformation
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
        <p class="max-w-md text-secondary-fixed-dim text-lg font-body leading-relaxed border-l border-secondary-fixed-dim/30 pl-6">
          We don't sell tools — we engineer outcomes. Strategy, architecture, and precision-built
          systems that last. No hype. No vendor lock-in. Just results that compound.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  copy: {
    type: Object,
    default: () => ({
      label: 'Engineering the Next Paradigm',
      headline: 'The Digital Infrastructure of Tomorrow.',
    }),
  },
});
</script>
