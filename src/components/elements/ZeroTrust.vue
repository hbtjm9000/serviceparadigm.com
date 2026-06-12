<template>
  <main id="main">
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-28 relative overflow-hidden">
      <div class="absolute -bottom-10 -right-20 text-[20rem] font-black text-white/5 font-serif pointer-events-none select-none">Zt</div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="inline-block border-2 border-secondary-fixed-dim p-4 mb-6"><span class="font-serif text-6xl text-secondary-fixed-dim">Zt</span></div>
        <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mt-4 max-w-4xl">Zero Trust <span class="italic text-secondary-fixed-dim">Element.</span></h1>
        <p class="mt-8 max-w-xl text-white/70 font-body leading-relaxed text-lg">Identity and access management built on zero trust principles. Never trust, always verify—protecting your organization from modern threats.</p>
      </div>
    </section>
    <section class="bg-surface py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center lg:grid-flow-dense">
          <div class="lg:col-start-2">
            <span class="font-body text-xs text-primary uppercase tracking-[0.4em] block">Element 02</span>
            <h2 class="font-serif text-4xl lg:text-5xl text-on-surface mt-4 leading-[1.1]">Never Trust. <span class="italic text-primary">Always Verify.</span></h2>
            <p class="font-body text-on-surface-variant mt-6 leading-relaxed text-lg">Zero trust isn't a product—it's a security posture. We implement identity-first access control, continuous verification, and least-privilege principles across your entire infrastructure.</p>
            <div class="grid grid-cols-2 gap-4 mt-8">
              <div v-for="f in features" :key="f" class="flex items-center gap-3"><div class="w-2 h-2 bg-secondary-fixed-dim flex-shrink-0"></div><span class="font-sans text-sm text-on-surface">{{ f }}</span></div>
            </div>
            <a href="/contact" class="inline-flex items-center gap-2 bg-primary text-on-primary font-sans text-sm px-6 py-3 mt-10 hover:bg-secondary transition-colors tracking-wide group">Secure Your Access <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
          </div>
          <div class="aspect-[4/3] bg-surface-container overflow-hidden flex items-center justify-center lg:col-start-1 lg:row-start-1">
            <span class="font-serif text-[12rem] text-on-surface/10">Zt</span>
          </div>
        </div>
      </div>
    </section>
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-24 text-center">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 class="font-serif text-4xl lg:text-5xl text-white leading-[1.1]">Protect what matters. <span class="italic text-secondary-fixed-dim">Zero trust, zero compromise.</span></h2>
        <a href="/contact" class="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed font-sans text-sm px-8 py-4 mt-10 hover:bg-white hover:text-on-surface transition-colors tracking-wide group">Deploy Zero Trust <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
      </div>
    </section>
  </main>
</template>
<script setup>
const features = ['Multi-factor authentication', 'Single sign-on', 'Conditional access', 'Identity governance', 'Least-privilege access', 'Continuous verification']
</script>
