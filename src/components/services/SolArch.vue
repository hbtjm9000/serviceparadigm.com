<template>
  <main id="main">
    <!-- Hero Section -->
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-28 relative overflow-hidden">
      <div class="absolute -bottom-10 -right-20 text-[20rem] font-black text-white/5 font-serif pointer-events-none select-none" aria-hidden="true">
        Solutions
      </div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <span class="font-sans text-xs tracking-[0.2em] text-secondary-fixed-dim uppercase">Solutions</span>
        <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mt-4 max-w-4xl text-balance">
          Solutions<br />
          <span class="italic text-secondary-fixed-dim">Architecture.</span>
        </h1>
        <p class="mt-8 max-w-xl text-white/70 font-body leading-relaxed text-lg">
          Designing scalable systems for modern organizations through cloud architecture, platform modernization, and integration architecture. We create technical blueprints that align with your business objectives.
        </p>
      </div>
    </section>

    <!-- Detail Section -->
    <section class="bg-surface py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center lg:grid-flow-dense">
          <div class="lg:col-start-2">
            <span class="font-body text-xs text-primary uppercase tracking-[0.4em] block">Modern Engineering</span>
            <h2 class="font-serif text-4xl lg:text-5xl text-on-surface mt-4 leading-[1.1]">
              Systems That <span class="italic text-primary">Scale.</span>
            </h2>
            <p class="font-body text-on-surface-variant mt-6 leading-relaxed text-lg">
              From legacy modernisation to cloud-native builds — we design systems that scale, adapt, and don't create the next round of technical debt. Every architecture decision is reversible, every component is replaceable.
            </p>
            <div class="grid grid-cols-2 gap-4 mt-8">
              <div v-for="item in features" :key="item" class="flex items-center gap-3">
                <div class="w-2 h-2 bg-secondary-fixed-dim flex-shrink-0"></div>
                <span class="font-sans text-sm text-on-surface">{{ item }}</span>
              </div>
            </div>
            <a href="/contact" class="inline-flex items-center gap-2 bg-primary text-on-primary font-sans text-sm px-6 py-3 mt-10 hover:bg-secondary transition-colors tracking-wide group">
              <span>Schedule Consultation</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          <div class="aspect-[4/3] bg-surface-container overflow-hidden lg:col-start-1 lg:row-start-1">
            <img src="/images/privacy-paper.jpg" alt="Solutions Architecture" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <!-- Domains Section -->
    <section class="bg-surface-container-low py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="max-w-3xl mb-16">
          <span class="font-body text-xs text-primary uppercase tracking-[0.4em] mb-4 block">Domains</span>
          <h2 class="font-serif text-4xl lg:text-5xl text-on-surface leading-[1.1]">
            Full-Spectrum <span class="italic text-primary">Architecture.</span>
          </h2>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="domain in domains" :key="domain.title" class="bg-surface p-8 hover:bg-primary hover:text-white transition-colors duration-300 group">
            <span class="font-serif text-5xl text-primary/30 group-hover:text-white/30">{{ domain.num }}</span>
            <h3 class="font-serif text-xl text-on-surface group-hover:text-white mt-4 mb-3">{{ domain.title }}</h3>
            <p class="font-body text-sm text-on-surface-variant group-hover:text-white/70 leading-relaxed">{{ domain.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <span class="font-body text-xs text-secondary-fixed-dim uppercase tracking-[0.4em] block">Ready to Build?</span>
        <h2 class="font-serif text-4xl lg:text-5xl text-white mt-4 leading-[1.1] max-w-2xl mx-auto">
          Stop maintaining. <span class="italic text-secondary-fixed-dim">Start architecting.</span>
        </h2>
        <p class="mt-6 max-w-lg mx-auto text-white/70 font-body leading-relaxed">
          Modernize your platform without rebuilding everything. We'll design the bridge from where you are to where you need to be.
        </p>
        <a href="/contact" class="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed font-sans text-sm px-8 py-4 mt-10 hover:bg-white hover:text-on-surface transition-colors tracking-wide group">
          <span>Discuss Your Architecture</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </section>
  </main>
</template>

<script setup>
const features = [
  'Cloud Architecture',
  'Platform Modernization',
  'Integration Architecture',
  'Microservices Design',
  'API Strategy',
  'Data Architecture',
]

const domains = [
  { num: '01', title: 'Cloud Architecture', description: 'Multi-cloud, hybrid, or private — we design cloud environments that match your workload, not the other way around.' },
  { num: '02', title: 'Platform Modernization', description: 'Migrate legacy systems to modern platforms without disrupting operations. Incremental, safe, reversible.' },
  { num: '03', title: 'Integration Architecture', description: 'Connect systems that weren\'t designed to talk to each other. APIs, event buses, and data pipelines that just work.' },
]
</script>
