<template>
  <main id="main">
    <!-- Hero Section -->
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-28 relative overflow-hidden">
      <div class="absolute -bottom-10 -right-20 text-[20rem] font-black text-white/5 font-serif pointer-events-none select-none" aria-hidden="true">
        AI
      </div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <span class="font-sans text-xs tracking-[0.2em] text-secondary-fixed-dim uppercase">AI Architecture</span>
        <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mt-4 max-w-4xl text-balance">
          AI Strategy &amp;<br />
          <span class="italic text-secondary-fixed-dim">Implementation.</span>
        </h1>
        <p class="mt-8 max-w-xl text-white/70 font-body leading-relaxed text-lg">
          Helping organizations identify and deploy AI opportunities through comprehensive readiness assessments, architecture design, and automation systems. We guide your transformation from traditional processes to intelligent, AI-powered operations.
        </p>
      </div>
    </section>

    <!-- What We Offer Section -->
    <section class="bg-surface py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="max-w-3xl">
          <span class="font-body text-xs text-primary uppercase tracking-[0.4em] mb-4 block">Framework</span>
          <h2 class="font-serif text-4xl lg:text-5xl text-on-surface leading-[1.1]">
            From Assessment to <span class="italic text-secondary-fixed-dim">Autonomous Operations.</span>
          </h2>
          <p class="font-body text-on-surface-variant mt-6 leading-relaxed text-lg">
            We don't sell tools — we engineer outcomes. Every engagement starts with understanding where you are and builds a clear path to where you need to be. Our AI offerings span discovery through deployment.
          </p>
        </div>

        <!-- Capabilities Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          <div v-for="cap in capabilities" :key="cap.title" class="bg-surface-container p-8 hover:bg-tertiary hover:text-white transition-colors duration-300 group">
            <div class="w-10 h-10 bg-primary/10 group-hover:bg-white/10 flex items-center justify-center mb-6">
              <span class="font-serif text-xl text-primary group-hover:text-white">{{ cap.symbol }}</span>
            </div>
            <h3 class="font-serif text-xl mb-3">{{ cap.title }}</h3>
            <p class="font-body text-sm text-on-surface-variant group-hover:text-white/70 leading-relaxed">{{ cap.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- $999 AI Consult Offering -->
    <section class="bg-surface-container-low py-20 lg:py-28 relative overflow-hidden">
      <div class="absolute -left-20 top-1/2 -translate-y-1/2 text-[12rem] font-black text-tertiary/5 font-serif pointer-events-none select-none" aria-hidden="true">
        $999
      </div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <div class="inline-block bg-primary/10 px-4 py-1 mb-6">
              <span class="font-label text-xs tracking-[0.2em] text-primary uppercase">Starting At</span>
            </div>
            <span class="font-body text-xs text-primary uppercase tracking-[0.4em] block">AI Readiness Consult</span>
            <h2 class="font-serif text-4xl lg:text-5xl text-on-surface mt-4 leading-[1.1]">
              AI <span class="italic text-primary">Readiness Assessment.</span>
            </h2>
            <p class="font-body text-on-surface-variant mt-6 leading-relaxed text-lg">
              A structured, one-day engagement to map your organization's AI maturity, identify high-impact automation opportunities, and produce a prioritized roadmap. No jargon. No upsell. Just a clear picture of where AI actually fits your business.
            </p>
            <div class="grid grid-cols-2 gap-4 mt-8">
              <div v-for="item in consultFeatures" :key="item" class="flex items-center gap-3">
                <div class="w-2 h-2 bg-secondary-fixed-dim flex-shrink-0"></div>
                <span class="font-sans text-sm text-on-surface">{{ item }}</span>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-4 mt-10 items-start sm:items-center">
              <span class="font-serif text-3xl text-primary">$999</span>
              <span class="font-body text-sm text-on-surface-variant">one-time engagement</span>
              <a href="/contact" class="inline-flex items-center gap-2 bg-primary text-on-primary font-sans text-sm px-6 py-3 hover:bg-secondary transition-colors tracking-wide group ml-auto">
                <span>Schedule Your Assessment</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
          <div class="aspect-[4/3] bg-surface-container overflow-hidden">
            <img src="/images/strategic-leader.jpg" alt="AI Readiness Assessment" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <!-- $99 Hermes Agent Hosted -->
    <section class="bg-surface py-20 lg:py-28 relative overflow-hidden">
      <div class="absolute -right-20 top-1/2 -translate-y-1/2 text-[12rem] font-black text-secondary-fixed-dim/5 font-serif pointer-events-none select-none" aria-hidden="true">
        Ha
      </div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center lg:grid-flow-dense">
          <div class="lg:col-start-2">
            <div class="inline-block bg-secondary-fixed-dim/10 px-4 py-1 mb-6">
              <span class="font-label text-xs tracking-[0.2em] text-secondary-fixed-dim uppercase">Element Ha</span>
            </div>
            <span class="font-body text-xs text-secondary-fixed-dim uppercase tracking-[0.4em] block">Managed Service</span>
            <h2 class="font-serif text-4xl lg:text-5xl text-on-surface mt-4 leading-[1.1]">
              Hermes Agent <span class="italic text-secondary-fixed-dim">Hosted.</span>
            </h2>
            <p class="font-body text-on-surface-variant mt-6 leading-relaxed text-lg">
              Deploy and manage your own autonomous AI agent infrastructure — powered by Nous Research's Hermes Agent. Fully deterministic, sovereign, and under your control. No lock-in, no black boxes, no per-seat licensing games.
            </p>
            <p class="font-body text-on-surface-variant mt-4 leading-relaxed">
              Your agent runs on dedicated infrastructure with 24/7 NOC support, private model inference, and full lifecycle management. Use it for research, automation, document processing, code review, or as your organization's AI operations hub.
            </p>
            <div class="grid grid-cols-2 gap-4 mt-8">
              <div v-for="item in haFeatures" :key="item" class="flex items-center gap-3">
                <div class="w-2 h-2 bg-secondary-fixed-dim flex-shrink-0"></div>
                <span class="font-sans text-sm text-on-surface">{{ item }}</span>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-4 mt-10 items-start sm:items-center">
              <span class="font-serif text-3xl text-secondary-fixed-dim">$99</span>
              <span class="font-body text-sm text-on-surface-variant">/month — hosted &amp; managed</span>
              <a href="/contact" class="inline-flex items-center gap-2 bg-secondary-fixed-dim text-white font-sans text-sm px-6 py-3 hover:bg-secondary transition-colors tracking-wide group ml-auto">
                <span>Deploy Your Agent</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
          <div class="aspect-[4/3] bg-surface-container overflow-hidden lg:col-start-1 lg:row-start-1">
            <img src="/images/cloud-engineering.jpg" alt="Hermes Agent Hosted" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-tertiary text-on-tertiary py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <span class="font-body text-xs text-secondary-fixed-dim uppercase tracking-[0.4em] block">Ready to Transform?</span>
        <h2 class="font-serif text-4xl lg:text-5xl text-white mt-4 leading-[1.1] max-w-2xl mx-auto">
          Start with a conversation. <span class="italic text-secondary-fixed-dim">No pressure.</span>
        </h2>
        <p class="mt-6 max-w-lg mx-auto text-white/70 font-body leading-relaxed">
          Whether you're ready for a full readiness assessment or just exploring what's possible, we'll help you find the right path.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
          <a href="/contact" class="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed font-sans text-sm px-8 py-4 hover:bg-white hover:text-on-surface transition-colors tracking-wide group">
            <span>Book a Discovery Call</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a href="/landings/packaged-ai" class="inline-flex items-center gap-2 border border-secondary-fixed-dim text-secondary-fixed-dim font-sans text-sm px-8 py-4 hover:bg-white/10 transition-colors tracking-wide group">
            <span>Explore Packaged AI</span>
          </a>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
const capabilities = [
  { symbol: '01', title: 'AI Readiness', description: 'Assess your organization\'s AI maturity, data infrastructure, and team readiness. Get a prioritized roadmap.' },
  { symbol: '02', title: 'Architecture Design', description: 'Design scalable AI architectures that integrate with your existing systems. No rip-and-replace.' },
  { symbol: '03', title: 'Automation Systems', description: 'Identify and implement high-ROI automation opportunities. From workflow automation to autonomous operations.' },
  { symbol: '04', title: 'Computer Vision', description: 'Visual inspection, object detection, document digitization, and image-based automation at scale.' },
]

const consultFeatures = [
  'AI maturity assessment',
  'Opportunity identification',
  'Prioritized roadmap',
  'Data readiness audit',
  'Team capability review',
  'Deliverable: 10-page report',
]

const haFeatures = [
  'Dedicated infrastructure',
  'Private model inference',
  'Full lifecycle management',
  '24/7 NOC support',
  'Deterministic workspace',
  'No per-seat licensing',
]
</script>
