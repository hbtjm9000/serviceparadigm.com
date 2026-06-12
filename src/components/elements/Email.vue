<template>
  <main id="main">
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-28 relative overflow-hidden">
      <div class="absolute -bottom-10 -right-20 text-[20rem] font-black text-white/5 font-serif pointer-events-none select-none">Em</div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="inline-block border-2 border-secondary-fixed-dim p-4 mb-6">
          <span class="font-serif text-6xl text-secondary-fixed-dim">Em</span>
        </div>
        <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mt-4 max-w-4xl">Email <span class="italic text-secondary-fixed-dim">Element.</span></h1>
        <p class="mt-8 max-w-xl text-white/70 font-body leading-relaxed text-lg">Enterprise-grade business email infrastructure with advanced security, compliance features, and seamless collaboration tools.</p>
      </div>
    </section>
    <section class="bg-surface py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <span class="font-body text-xs text-primary uppercase tracking-[0.4em] block">Element 01</span>
            <h2 class="font-serif text-4xl lg:text-5xl text-on-surface mt-4 leading-[1.1]">Professional Email <span class="italic text-primary">Infrastructure.</span></h2>
            <p class="font-body text-on-surface-variant mt-6 leading-relaxed text-lg">Reliable email hosting with custom domains, enterprise-grade spam filtering, archiving, and full mobile sync. Your brand, your inbox, your rules.</p>
            <div class="grid grid-cols-2 gap-4 mt-8">
              <div v-for="f in features" :key="f" class="flex items-center gap-3"><div class="w-2 h-2 bg-secondary-fixed-dim flex-shrink-0"></div><span class="font-sans text-sm text-on-surface">{{ f }}</span></div>
            </div>
            <a href="/contact" class="inline-flex items-center gap-2 bg-primary text-on-primary font-sans text-sm px-6 py-3 mt-10 hover:bg-secondary transition-colors tracking-wide group">Get Email <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
          </div>
          <div class="aspect-[4/3] bg-surface-container overflow-hidden flex items-center justify-center">
            <span class="font-serif text-[12rem] text-on-surface/10">Em</span>
          </div>
        </div>
      </div>
    </section>
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-24 text-center">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 class="font-serif text-4xl lg:text-5xl text-white leading-[1.1]">Ready for reliable email? <span class="italic text-secondary-fixed-dim">Let's talk.</span></h2>
        <a href="/contact" class="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed font-sans text-sm px-8 py-4 mt-10 hover:bg-white hover:text-on-surface transition-colors tracking-wide group">Set Up Your Email <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
      </div>
    </section>
  </main>
</template>
<script setup>
const features = ['Custom domains', 'Advanced spam filtering', 'Email archiving', 'Mobile sync', 'Calendar integration', '99.9% uptime SLA']
</script>
