<template>
  <div class="static" @mouseenter="open" @mouseleave="scheduleClose">
    <button
      @click="toggle"
      class="font-headline italic text-lg text-slate-300 hover:text-white transition-colors tracking-tight flex items-center gap-1.5"
    >
      Elements
      <svg
        :class="['w-3 h-3 transition-transform', isOpen ? 'rotate-180' : '']"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="isOpen"
      class="fixed left-0 right-0 z-50"
      style="top: 64px"
      @mouseenter="cancelClose"
      @mouseleave="close"
    >
      <div class="bg-surface border-t border-outline-variant/20 shadow-2xl">
        <div class="max-w-5xl mx-auto px-6 lg:px-8 py-10">
          <div class="flex items-center gap-3 mb-8">
            <span class="font-body text-xs text-primary uppercase tracking-[0.4em]">Managed Services</span>
            <div class="h-px flex-1 bg-outline-variant/30"></div>
          </div>
          <div class="grid grid-cols-3 gap-0 border-collapse">
            <div v-for="(el, i) in elements" :key="el.symbol"
              @click="go(el.route)"
              @keydown.enter="go(el.route)"
              @keydown.space.prevent="go(el.route)"
              tabindex="0" role="menuitem"
              :class="[
                'p-6 cursor-pointer transition-colors duration-300 group text-center',
                i % 2 === 0
                  ? 'bg-surface-container hover:bg-primary'
                  : 'bg-surface-container-highest hover:bg-tertiary'
              ]"
            >
              <div class="inline-block border border-on-surface/20 group-hover:border-white/30 p-3 mb-3 transition-colors">
                <span class="font-serif text-2xl text-on-surface group-hover:text-white transition-colors">{{ el.symbol }}</span>
              </div>
              <h3 class="font-sans text-sm tracking-wide text-on-surface group-hover:text-white uppercase transition-colors">{{ el.name }}</h3>
              <p class="font-body text-xs text-on-surface-variant group-hover:text-white/70 mt-2 leading-relaxed max-w-[200px] mx-auto transition-colors">{{ el.short }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
let timer = null

const elements = [
  { symbol: 'Ax', name: 'Automata', route: '/elements/automata', short: 'Autonomous AI agents for business processes — self-hosted in Jamaica.' },
  { symbol: 'Em', name: 'Email', route: '/elements/email', short: 'Enterprise business email with advanced security and compliance.' },
  { symbol: 'Zt', name: 'Zero Trust', route: '/elements/zero-trust', short: 'Identity and access management built on zero trust principles.' },
  { symbol: 'Dp', name: 'Digital Presence', route: '/elements/digital-presence', short: 'Websites and social media to establish your digital footprint.' },
  { symbol: 'Bc', name: 'Business Continuity', route: '/elements/business-continuity', short: 'Backup and disaster recovery for any disruption.' },
  { symbol: 'Cp', name: 'Cloud', route: '/elements/cloud', short: 'Cloud hosting and infrastructure across leading platforms.' },
  { symbol: 'Ha', name: 'Hermes Agent', route: '/elements/hermes-agent', short: 'Autonomous AI agent infrastructure, fully under your control.' },
]

function open() { clear(); isOpen.value = true }
function close() { isOpen.value = false }
function clear() { if (timer) { clearTimeout(timer); timer = null } }
function cancelClose() { clear() }
function scheduleClose() { timer = setTimeout(() => close(), 250) }
function toggle() { isOpen.value = !isOpen.value }
function go(route) { isOpen.value = false; window.location.href = route }

function onKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) { isOpen.value = false }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => { document.removeEventListener('keydown', onKeydown); clear() })
</script>
