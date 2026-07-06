<template>
  <div>
    <!-- Featured Article -->
    <section class="bg-surface py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500">Loading articles...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-500">Failed to load articles.</p>
        </div>

        <!-- Empty -->
        <div v-else-if="articles.length === 0" class="text-center py-12">
          <p class="text-gray-500">No articles published yet. Check back soon.</p>
        </div>

        <!-- Featured + Grid -->
        <template v-else>
          <!-- Featured article: first pinned article, or first article overall -->
          <article class="grid lg:grid-cols-2 gap-12 items-center group border border-outline p-8 lg:p-12" :key="featured.id">
            <div class="aspect-[16/10] bg-surface-container overflow-hidden flex items-center justify-center">
              <img
                v-if="featured.image_url"
                :src="featured.image_url"
                :alt="featured.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span v-else class="text-on-surface-variant font-serif text-6xl italic opacity-30">Featured</span>
            </div>
            <div>
              <div class="flex items-center gap-4 mb-4">
                <span v-if="featured.is_pinned" class="bg-primary text-on-primary font-sans text-[10px] tracking-[0.15em] uppercase px-3 py-1">Featured</span>
                <span class="font-sans text-xs tracking-[0.15em] text-primary uppercase">{{ featured.category || 'Article' }}</span>
                <span class="text-outline">•</span>
                <span class="font-sans text-xs text-on-surface-variant">{{ formatDate(featured.published_at) }}</span>
              </div>
              <h2 class="font-serif text-3xl lg:text-4xl text-on-surface leading-tight group-hover:text-primary transition-colors">
                <a :href="`/insights/${featured.slug}/`">{{ featured.title }}</a>
              </h2>
              <p class="font-body text-on-surface-variant mt-4 leading-relaxed text-lg">
                {{ featured.excerpt }}
              </p>
              <div class="flex items-center gap-6 mt-6">
                <span class="font-sans text-xs text-on-surface-variant">{{ featured.read_time_minutes }} min read</span>
                <a
                  :href="`/insights/${featured.slug}/`"
                  class="inline-flex items-center gap-2 font-sans text-sm text-primary hover:gap-3 transition-all tracking-wide"
                >
                  Read Article
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </article>

          <!-- Article Grid -->
          <section class="bg-surface-container-low py-20 lg:py-24 -mx-6 lg:-mx-8 px-6 lg:px-8 mt-20 lg:mt-24">
            <div class="max-w-7xl mx-auto">
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <article
                  v-for="article in rest"
                  :key="article.id"
                  class="group"
                >
                  <div class="aspect-[16/10] bg-surface-container overflow-hidden mb-6 flex items-center justify-center">
                    <img
                      v-if="article.image_url"
                      :src="article.image_url"
                      :alt="article.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span v-else class="text-on-surface-variant font-serif italic opacity-20">{{ article.category === 'Position' ? 'Opinion' : 'Article' }}</span>
                  </div>
                  <div class="flex items-center gap-4 mb-3">
                    <span class="font-sans text-xs tracking-[0.15em] text-primary uppercase">{{ article.category || 'Article' }}</span>
                    <span class="text-outline">•</span>
                    <span class="font-sans text-xs text-on-surface-variant">{{ formatDate(article.published_at) }}</span>
                  </div>
                  <h3 class="font-serif text-xl lg:text-2xl text-on-surface leading-tight group-hover:text-primary transition-colors">
                    <a :href="`/insights/${article.slug}/`">{{ article.title }}</a>
                  </h3>
                  <p class="font-body text-on-surface-variant mt-3 leading-relaxed line-clamp-3">
                    {{ article.excerpt }}
                  </p>
                  <div class="flex items-center justify-between mt-4">
                    <span class="font-sans text-xs text-on-surface-variant">{{ article.read_time_minutes }} min read</span>
                    <a
                      :href="`/insights/${article.slug}/`"
                      class="font-sans text-sm text-primary hover:text-secondary transition-colors tracking-wide"
                    >
                      Read →
                    </a>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  category: string
  image_url: string
  read_time_minutes: number
  sort_order: number
  is_pinned: number
  published_at: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const articles = ref<Article[]>([])

const featured = computed(() => {
  const pinned = articles.value.find(a => a.is_pinned)
  return pinned || articles.value[0]
})

const rest = computed(() =>
  articles.value.filter(a => a.id !== featured.value?.id)
)

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(async () => {
  try {
    const res = await fetch('/api/articles')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    articles.value = data.articles || []
  } catch (err) {
    console.error('Failed to load articles:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
