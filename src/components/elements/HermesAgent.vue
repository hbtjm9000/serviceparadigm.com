<template>
  <main id="main">
    <!-- Hero -->
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-28 relative overflow-hidden">
      <div class="absolute -bottom-10 -right-20 text-[20rem] font-black text-white/5 font-serif pointer-events-none select-none">Ha</div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="inline-block border-2 border-secondary-fixed-dim p-4 mb-6"><span class="font-serif text-6xl text-secondary-fixed-dim">Ha</span></div>
        <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mt-4 max-w-4xl">Your AI Chief of Staff. <span class="italic text-secondary-fixed-dim">24/7. On Your Infrastructure.</span></h1>
        <p class="mt-8 max-w-xl text-white/70 font-body leading-relaxed text-lg">Not a chatbot. A permanent Chief of Staff that remembers everything, works across every platform, and executes in a secure sandbox — deployed on your infrastructure, under your control.</p>
        <div class="flex flex-wrap gap-4 mt-10">
          <a href="/contact" class="inline-flex items-center gap-2 bg-primary text-on-primary font-sans text-sm px-6 py-3 hover:bg-secondary transition-colors tracking-wide group">Deploy Your Ha <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
          <a href="/ha/cortex" class="inline-flex items-center gap-2 border border-white/30 text-white font-sans text-sm px-6 py-3 hover:bg-white/10 transition-colors tracking-wide">How Cortex Works</a>
        </div>
      </div>
    </section>

    <!-- Problem -->
    <section class="bg-surface py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
          <span class="font-body text-xs text-primary uppercase tracking-[0.4em] block">The Problem</span>
          <h2 class="font-serif text-4xl lg:text-5xl text-on-surface mt-4 leading-[1.1]">Every AI Agent Has the Same Problem: <span class="italic text-primary">It Forgets.</span></h2>
          <p class="font-body text-on-surface-variant mt-6 leading-relaxed text-lg">You ask it to research something. It does. The answer vanishes when the conversation ends. Tomorrow you ask again — starting from zero. That's not a Chief of Staff. That's a calculator you have to re-explain the problem to every time.</p>
          <p class="font-body text-on-surface-variant mt-4 leading-relaxed text-lg">Ha solves this. Three capabilities that make it different — and together, make it the only AI agent that compounds knowledge instead of losing it.</p>
        </div>
      </div>
    </section>

    <!-- 3 USPs -->
    <section class="bg-surface-container py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
          <!-- Cortex -->
          <div class="bg-surface p-8 lg:p-10">
            <div class="w-12 h-12 bg-primary/10 flex items-center justify-center mb-6"><span class="font-serif text-2xl text-primary font-bold">Cx</span></div>
            <h3 class="font-serif text-2xl text-on-surface">Cortex —<br><span class="italic text-primary">Permanent Knowledge.</span></h3>
            <p class="font-body text-on-surface-variant mt-4 leading-relaxed text-sm">Every research output, every captured document, every insight — saved permanently. Nothing disappears between sessions. Ha builds a knowledge graph over time. Every answer is grounded in everything it already knows.</p>
            <a href="/ha/cortex" class="inline-flex items-center gap-2 font-sans text-sm text-primary hover:text-secondary transition-colors mt-6 group">Learn More <svg class="h-3 w-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
          </div>
          <!-- Sandbox -->
          <div class="bg-surface p-8 lg:p-10">
            <div class="w-12 h-12 bg-primary/10 flex items-center justify-center mb-6"><span class="font-serif text-2xl text-primary font-bold">Sx</span></div>
            <h3 class="font-serif text-2xl text-on-surface">Sandbox —<br><span class="italic text-primary">Safe by Design.</span></h3>
            <p class="font-body text-on-surface-variant mt-4 leading-relaxed text-sm">Every command runs in an isolated container. Read-only filesystem. No host access. No Docker socket. If a prompt goes wrong, the blast radius is zero. Your data, your code, your infrastructure — protected.</p>
            <a href="/ha/sandbox" class="inline-flex items-center gap-2 font-sans text-sm text-primary hover:text-secondary transition-colors mt-6 group">Learn More <svg class="h-3 w-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
          </div>
          <!-- MoA -->
          <div class="bg-surface p-8 lg:p-10">
            <div class="w-12 h-12 bg-primary/10 flex items-center justify-center mb-6"><span class="font-serif text-2xl text-primary font-bold">Mo</span></div>
            <h3 class="font-serif text-2xl text-on-surface">MoA —<br><span class="italic text-primary">Multiple Minds, One Answer.</span></h3>
            <p class="font-body text-on-surface-variant mt-4 leading-relaxed text-sm">Not one AI model — three. Each with different strengths. On every hard question, Ha runs the advisors in parallel, then synthesises their best reasoning into a single answer. No blind spots.</p>
            <a href="/ha/moa" class="inline-flex items-center gap-2 font-sans text-sm text-primary hover:text-secondary transition-colors mt-6 group">Learn More <svg class="h-3 w-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="bg-surface py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="font-serif text-4xl lg:text-5xl text-on-surface leading-[1.1]">What You Get.</h2>
          <p class="font-body text-on-surface-variant mt-4 max-w-2xl mx-auto">One deployment. Every capability.</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="f in features" :key="f.title" class="bg-surface-container p-6">
            <div class="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4"><span class="font-serif text-lg text-primary font-bold">{{ f.symbol }}</span></div>
            <h3 class="font-sans text-sm text-on-surface font-semibold tracking-wide uppercase">{{ f.title }}</h3>
            <p class="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-24 text-center">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 class="font-serif text-4xl lg:text-5xl text-white leading-[1.1]">$99/mo — hosted & managed. <span class="italic text-secondary-fixed-dim">Your AI, your data, your control.</span></h2>
        <p class="text-white/70 font-body mt-4 max-w-lg mx-auto">Includes Cortex knowledge graph, bounded sandbox, MoA multi-model orchestration, Telegram/WhatsApp/Discord gateway, and 24/7 NOC support.</p>
        <a href="/contact" class="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed font-sans text-sm px-8 py-4 mt-10 hover:bg-white hover:text-on-surface transition-colors tracking-wide group">Deploy Your Ha <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></a>
      </div>
    </section>
  </main>
</template>

<script setup>
const features = [
  { symbol: 'Cx', title: 'Cortex Knowledge Graph', desc: 'Permanent, graph-indexed knowledge that compounds. Every research output and captured document becomes a searchable node. Nothing disappears.' },
  { symbol: 'Sx', title: 'Bounded Sandbox', desc: 'Isolated execution environment. Read-only filesystem, no host access, resource-limited. Zero blast radius on bad prompts.' },
  { symbol: 'Mo', title: 'Mixture of Agents', desc: 'Three AI models in parallel — advisors generate analysis, an aggregator synthesises the final answer. Catches blind spots.' },
  { symbol: 'Ha', title: 'Multi-Platform Gateway', desc: 'Works on Telegram, Discord, WhatsApp, Signal, Email, and CLI. Same agent, same memory, everywhere.' },
  { symbol: 'Ha', title: 'Persistent Local Memory', desc: 'Remembers your preferences, writing style, and recurring tasks across sessions. Zero external API calls — your data stays on your infrastructure.' },
  { symbol: 'Ha', title: 'Curated Agent Skills', desc: 'Research, content capture, morning housekeeping, writing, operations — pre-installed and security-reviewed. Ready on day one.' },
]
</script>
