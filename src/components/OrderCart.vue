<template>
  <section v-if="enabled" class="bg-surface py-20 lg:py-28">
    <div class="max-w-4xl mx-auto px-6 lg:px-8">
      <div class="flex items-center gap-3 mb-2">
        <span class="font-body text-xs text-primary uppercase tracking-[0.4em]">Order</span>
        <div class="h-px flex-1 bg-outline-variant/30"></div>
      </div>
      <h2 class="font-serif text-4xl lg:text-5xl text-on-surface leading-[1.1] mb-4">Place an <span class="italic text-primary">Order.</span></h2>
      <p class="font-body text-on-surface-variant leading-relaxed mb-10 max-w-2xl">Select the services you need, add your details, and we'll get started. No payment details are handled here — you'll be redirected to a secure checkout.</p>

      <!-- Service Catalog -->
      <div class="grid gap-4 mb-12">
        <div v-for="item in catalog" :key="item.id"
          class="flex items-center justify-between p-6 bg-surface-container-low hover:bg-surface-container transition-colors"
        >
          <div class="flex-1">
            <h3 class="font-serif text-xl text-on-surface">{{ item.name }}</h3>
            <p class="font-body text-sm text-on-surface-variant mt-1">{{ item.description }}</p>
          </div>
          <div class="text-right ml-6 flex-shrink-0">
            <span class="font-serif text-lg text-primary block">{{ item.priceLabel }}</span>
            <span class="font-body text-xs text-on-surface-variant block mt-0.5">{{ item.period }}</span>
          </div>
          <button @click="addToCart(item)"
            :disabled="inCart(item.id)"
            class="ml-6 px-4 py-2 font-label font-bold uppercase tracking-widest text-xs transition-all duration-200 flex-shrink-0"
            :class="inCart(item.id)
              ? 'bg-secondary-fixed-dim/20 text-secondary-fixed-dim cursor-not-allowed'
              : 'bg-primary text-on-primary hover:bg-secondary'"
          >
            {{ inCart(item.id) ? 'Added' : 'Add' }}
          </button>
        </div>

        <!-- Custom amount -->
        <div class="flex items-center justify-between p-6 bg-surface-container-lowest">
          <div class="flex-1">
            <h3 class="font-serif text-xl text-on-surface">Custom Engagement</h3>
            <p class="font-body text-sm text-on-surface-variant mt-1">Describe what you need and we'll tailor a solution.</p>
          </div>
          <div class="ml-6 flex-shrink-0">
            <input v-model="customAmount" type="number" min="0" step="50" placeholder="$ amount"
              class="w-28 bg-surface border border-outline-variant/30 px-3 py-2 font-body text-sm text-on-surface text-right"
            />
          </div>
          <button @click="addCustom"
            :disabled="!customAmount || parseFloat(customAmount) <= 0"
            class="ml-6 px-4 py-2 font-label font-bold uppercase tracking-widest text-xs transition-all duration-200 flex-shrink-0"
            :class="!customAmount || parseFloat(customAmount) <= 0
              ? 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
              : 'bg-primary text-on-primary hover:bg-secondary'"
          >
            Add
          </button>
        </div>
      </div>

      <!-- Cart -->
      <div v-if="cart.length > 0" class="bg-surface-container-low p-6 lg:p-8 mb-10">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-serif text-2xl text-on-surface">Your Cart</h3>
          <button @click="clearCart" class="font-label text-xs uppercase tracking-widest text-red-500 hover:text-red-400">Clear</button>
        </div>
        <div v-for="(item, i) in cart" :key="item.id"
          class="flex items-center justify-between py-3"
          :class="i < cart.length - 1 ? 'border-b border-outline-variant/20' : ''"
        >
          <div class="flex items-center gap-3">
            <span class="font-body text-sm text-on-surface">{{ item.name }}</span>
            <span v-if="item.qty > 1" class="font-body text-xs text-on-surface-variant">× {{ item.qty }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="font-body text-sm text-on-surface">{{ formatPrice(item.total || item.price) }}</span>
            <button @click="removeFromCart(item.id)" class="text-on-surface-variant/50 hover:text-red-400 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant/30">
          <span class="font-serif text-xl text-on-surface">Total</span>
          <span class="font-serif text-2xl text-primary">{{ formatPrice(total) }}</span>
        </div>
      </div>

      <!-- Empty cart state -->
      <div v-else class="text-center py-12 mb-10 bg-surface-container-lowest">
        <svg class="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
        </svg>
        <p class="font-body text-on-surface-variant/60">Your cart is empty. Select a service above.</p>
      </div>

      <!-- Customer Details -->
      <div class="bg-surface-container-low p-6 lg:p-8">
        <h3 class="font-serif text-2xl text-on-surface mb-6">Your Details</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">Name *</label>
            <input v-model="details.name" type="text" class="w-full bg-surface border border-outline-variant/30 px-4 py-2.5 font-body text-sm text-on-surface" placeholder="Full name" />
          </div>
          <div>
            <label class="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">Email *</label>
            <input v-model="details.email" type="email" class="w-full bg-surface border border-outline-variant/30 px-4 py-2.5 font-body text-sm text-on-surface" placeholder="you@company.com" />
          </div>
          <div>
            <label class="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">Phone</label>
            <input v-model="details.phone" type="tel" class="w-full bg-surface border border-outline-variant/30 px-4 py-2.5 font-body text-sm text-on-surface" placeholder="+1 876 555 0000" />
          </div>
          <div>
            <label class="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">Company</label>
            <input v-model="details.company" type="text" class="w-full bg-surface border border-outline-variant/30 px-4 py-2.5 font-body text-sm text-on-surface" placeholder="Company name" />
          </div>
        </div>
        <div class="mt-6">
          <label class="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">Notes / Project Description</label>
          <textarea v-model="details.notes" rows="3" class="w-full bg-surface border border-outline-variant/30 px-4 py-2.5 font-body text-sm text-on-surface" placeholder="Tell us about your project..."></textarea>
        </div>
      </div>

      <!-- Submit -->
      <div class="mt-10 text-center">
        <p v-if="error" class="font-body text-sm text-red-400 mb-4">{{ error }}</p>
        <button @click="submitOrder"
          :disabled="submitting || cart.length === 0"
          class="font-label font-bold uppercase tracking-widest text-sm px-10 py-4 transition-all duration-200"
          :class="cart.length === 0
            ? 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
            : submitting
              ? 'bg-primary/50 text-on-primary cursor-wait'
              : 'bg-primary text-on-primary hover:bg-secondary'"
        >
          {{ submitting ? 'Processing...' : 'Place Order' }}
        </button>
        <p class="font-body text-xs text-on-surface-variant/60 mt-4">
          No payment details collected here. After placing, you'll be redirected to a secure checkout page.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { isOn } from '../lib/features'

// ── Feature Flag ──
const enabled = isOn('order-form-enabled')

// ── Catalog ──
const catalog = [
  { id: 'ai-consult', name: 'AI Readiness Consult', description: 'One-day structured assessment of your AI maturity, opportunities, and roadmap.', price: 999, priceLabel: '$999', period: 'one-time' },
  { id: 'hermes-hosted', name: 'Hermes Agent Hosted', description: 'Managed autonomous AI agent on dedicated infrastructure with 24/7 NOC support.', price: 99, priceLabel: '$99', period: '/month' },
]

const customAmount = ref('')
const cart = ref([])
const submitting = ref(false)
const error = ref('')

const details = ref({ name: '', email: '', phone: '', company: '', notes: '' })

function inCart(id) { return cart.value.some(i => i.id === id) }

function addToCart(item) {
  const existing = cart.value.find(i => i.id === item.id)
  if (existing) {
    existing.qty = (existing.qty || 1) + 1
  } else {
    cart.value.push({ ...item, qty: 1 })
  }
}

function addCustom() {
  const amt = parseFloat(customAmount.value)
  if (!amt || amt <= 0) return
  const id = 'custom-' + Date.now()
  cart.value.push({ id, name: 'Custom Engagement', price: amt, priceLabel: '$' + amt, qty: 1, total: amt })
  customAmount.value = ''
}

function removeFromCart(id) {
  cart.value = cart.value.filter(i => i.id !== id)
}

function clearCart() { cart.value = [] }

const total = computed(() => {
  return cart.value.reduce((sum, i) => sum + (i.total || i.price) * (i.qty || 1), 0)
})

function formatPrice(amount) {
  return '$' + amount.toLocaleString('en-US')
}

function submitOrder() {
  error.value = ''

  // Validate
  if (cart.value.length === 0) { error.value = 'Your cart is empty.'; return }
  if (!details.value.name.trim()) { error.value = 'Please enter your name.'; return }
  if (!details.value.email.trim()) { error.value = 'Please enter your email.'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.value.email)) { error.value = 'Please enter a valid email.'; return }

  submitting.value = true

  const order = {
    items: cart.value.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty || 1 })),
    total: total.value,
    customer: { ...details.value },
    timestamp: new Date().toISOString(),
  }

  // Store order reference in localStorage
  try {
    const orders = JSON.parse(localStorage.getItem('paradigm_orders') || '[]')
    orders.push({ ...order, orderRef: 'ORD-' + Date.now().toString(36).toUpperCase() })
    localStorage.setItem('paradigm_orders', JSON.stringify(orders))
  } catch {}

  // POST order to webhook (Cloudflare Worker — placeholder URL)
  const WEBHOOK_URL = import.meta.env.PUBLIC_ORDER_WEBHOOK_URL || ''

  if (WEBHOOK_URL) {
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch(() => {
      // Non-blocking — order saved locally
    })
  }

  // Simulate redirect to payment provider hosted page
  // TODO: Replace with actual eZeePayments/WiPay hosted checkout URL
  const paymentUrl = import.meta.env.PUBLIC_PAYMENT_CHECKOUT_URL || ''
  if (paymentUrl) {
    const params = new URLSearchParams({
      amount: total.value.toString(),
      currency: 'USD',
      orderRef: 'ORD-' + Date.now().toString(36).toUpperCase(),
      callback: window.location.origin + '/order/confirm',
    })
    window.location.href = paymentUrl + '?' + params.toString()
  } else {
    // No payment provider configured — show confirmation locally
    submitting.value = false
    showConfirmation(order)
  }
}

function showConfirmation(order) {
  cart.value = []
  details.value = { name: '', email: '', phone: '', company: '', notes: '' }
  alert('Order received! Reference: ' + order.orderRef + '\n\nWe\'ll be in touch within 24 hours.')
}
</script>
