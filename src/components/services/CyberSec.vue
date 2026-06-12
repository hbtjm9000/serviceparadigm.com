<template>
  <main id="main">
    <!-- Hero Section -->
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-28 relative overflow-hidden">
      <div class="absolute -bottom-10 -right-20 text-[20rem] font-black text-white/5 font-serif pointer-events-none select-none" aria-hidden="true">
        Security
      </div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <span class="font-sans text-xs tracking-[0.2em] text-secondary-fixed-dim uppercase">Security</span>
        <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mt-4 max-w-4xl text-balance">
          Cybersecurity<br />
          <span class="italic text-secondary-fixed-dim">Architecture.</span>
        </h1>
        <p class="mt-8 max-w-xl text-white/70 font-body leading-relaxed text-lg">
          Designing security into systems from the beginning through zero trust architectures, security posture design, and compliance architecture. Protect your enterprise with defense-in-depth strategies.
        </p>
      </div>
    </section>

    <!-- Detail Section -->
    <section class="bg-surface py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <span class="font-body text-xs text-primary uppercase tracking-[0.4em] block">Zero Trust</span>
            <h2 class="font-serif text-4xl lg:text-5xl text-on-surface mt-4 leading-[1.1]">
              Security by <span class="italic text-primary">Design.</span>
            </h2>
            <p class="font-body text-on-surface-variant mt-6 leading-relaxed text-lg">
              Security isn't a feature — it's a property of good architecture. We design zero trust postures that protect your enterprise from the inside out, not the perimeter in. Defense-in-depth that holds under pressure.
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
          <div class="aspect-[4/3] bg-surface-container overflow-hidden">
            <img src="/images/security-protocol.jpg" alt="Cybersecurity Architecture" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <!-- Approach Section -->
    <section class="bg-surface-container-low py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="max-w-3xl mb-16">
          <span class="font-body text-xs text-primary uppercase tracking-[0.4em] mb-4 block">Methodology</span>
          <h2 class="font-serif text-4xl lg:text-5xl text-on-surface leading-[1.1]">
            Architecture-First <span class="italic text-primary">Security.</span>
          </h2>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="step in approach" :key="step.title" class="bg-surface p-8">
            <span class="font-serif text-5xl text-primary/30">{{ step.num }}</span>
            <h3 class="font-serif text-xl text-on-surface mt-4 mb-3">{{ step.title }}</h3>
            <p class="font-body text-sm text-on-surface-variant leading-relaxed">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <span class="font-body text-xs text-secondary-fixed-dim uppercase tracking-[0.4em] block">Secure Your Enterprise</span>
        <h2 class="font-serif text-4xl lg:text-5xl text-white mt-4 leading-[1.1] max-w-2xl mx-auto">
          Don't wait for a breach. <span class="italic text-secondary-fixed-dim">Architect it right.</span>
        </h2>
        <p class="mt-6 max-w-lg mx-auto text-white/70 font-body leading-relaxed">
          Zero trust isn't a product — it's a posture. We'll help you build one that holds.
        </p>
        <a href="/contact" class="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed font-sans text-sm px-8 py-4 mt-10 hover:bg-white hover:text-on-surface transition-colors tracking-wide group">
          <span>Schedule a Security Review</span>
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
  'Zero Trust Architectures',
  'Security Posture Design',
  'Compliance Architecture',
  'Identity & Access Management',
  'Threat Modeling',
  'Security Operations',
]

const approach = [
  { num: '01', title: 'Assess', description: 'Map your current security posture, identify blind spots, and understand your threat landscape before we design anything.' },
  { num: '02', title: 'Architect', description: 'Design a zero trust architecture that protects data, identities, and infrastructure without slowing down your business.' },
  { num: '03', title: 'Operationalize', description: 'Deploy controls, train your team, and establish continuous monitoring. Security that adapts as threats evolve.' },
]
</script>
