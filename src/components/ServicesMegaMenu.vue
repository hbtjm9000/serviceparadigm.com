<template>
  <div class="static" @mouseenter="open" @mouseleave="scheduleClose">
    <button
      @click="toggle"
      class="font-headline italic text-lg text-slate-300 hover:text-white transition-colors tracking-tight flex items-center gap-1.5"
    >
      Services
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
      <div class="bg-surface text-on-surface border-t border-outline-variant/20 shadow-2xl">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div class="flex items-center gap-3 mb-8">
            <span class="font-body text-xs text-primary uppercase tracking-[0.4em]">Core Paradigms</span>
            <div class="h-px flex-1 bg-outline-variant/30"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-0 border-collapse">
            <div v-for="(s, i) in services" :key="s.id"
              @click="go(s.id)"
              @keydown.enter="go(s.id)"
              @keydown.space.prevent="go(s.id)"
              tabindex="0" role="menuitem"
              :class="[
                'p-8 cursor-pointer transition-colors duration-300 group',
                i === 0 ? 'bg-surface-container hover:bg-tertiary' :
                i === 1 ? 'bg-surface-container-high hover:bg-primary' :
                'bg-surface-container hover:bg-slate-900'
              ]"
            >
              <span :class="['font-body text-xs block mb-8 opacity-50 group-hover:opacity-80']">{{ s.label }}</span>
              <h3 class="font-serif text-2xl mb-4 group-hover:italic group-hover:text-white transition-colors">{{ s.title }}</h3>
              <p class="font-body text-sm text-on-surface-variant group-hover:text-white/70 leading-relaxed mb-6 transition-colors">{{ s.description }}</p>
              <span :class="['inline-flex items-center gap-2 font-label font-bold uppercase tracking-widest text-xs transition-all duration-300 text-primary group-hover:text-white']">
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
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

const services = [
  { id: 'ai-strategy', label: 'AI Architecture', title: 'AI Strategy', description: 'We map your readiness, identify high-impact AI opportunities, and design the architecture to execute.' },
  { id: 'solutions-architecture', label: 'Solutions', title: 'Solutions Architecture', description: 'From legacy modernisation to cloud-native builds — we design systems that scale, adapt, and don\'t create the next round of technical debt.' },
  { id: 'cybersecurity', label: 'Security', title: 'Cybersecurity Architecture', description: 'Security designed in from the start, not bolted on after a breach. We build postures that hold under pressure.' },
]

function open() { clear(); isOpen.value = true }
function close() { isOpen.value = false }
function clear() { if (timer) { clearTimeout(timer); timer = null } }
function cancelClose() { clear() }
function scheduleClose() { timer = setTimeout(() => close(), 250) }
function toggle() { isOpen.value = !isOpen.value }
function go(id) { isOpen.value = false; window.location.href = '/services/' + id }

function onKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) { isOpen.value = false }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => { document.removeEventListener('keydown', onKeydown); clear() })
</script>
