<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin h-8 w-8 text-primary mx-auto mb-4">
        <svg viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p class="text-gray-500 font-body">Loading article...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-surface py-20">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <h1 class="font-serif text-4xl text-on-surface mb-4">Article not found</h1>
        <p class="text-on-surface-variant mb-8">{{ error }}</p>
        <a href="/insights/" class="font-sans text-sm text-primary hover:text-secondary tracking-wide">
          ← Back to Insights
        </a>
      </div>
    </div>

    <!-- Article -->
    <template v-else-if="article">
      <!-- Hero -->
      <section v-if="article.image_url" class="aspect-[21/9] relative overflow-hidden bg-surface-container">
        <img
          :src="article.image_url"
          :alt="article.title"
          class="w-full h-full object-cover"
        />
      </section>

      <!-- Content -->
      <section class="bg-surface py-16 lg:py-24">
        <div class="max-w-3xl mx-auto px-6 lg:px-8">
          <!-- Meta -->
          <div class="flex items-center gap-4 mb-6">
            <span class="font-sans text-xs tracking-[0.15em] text-primary uppercase">{{ article.category || 'Article' }}</span>
            <span class="text-outline">•</span>
            <span class="font-sans text-xs text-on-surface-variant">{{ formatDate(article.published_at) }}</span>
            <span class="text-outline">•</span>
            <span class="font-sans text-xs text-on-surface-variant">{{ article.read_time_minutes }} min read</span>
          </div>

          <!-- Title -->
          <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl text-on-surface leading-[1.05] mb-8">
            {{ article.title }}
          </h1>

          <!-- Excerpt -->
          <p v-if="article.excerpt" class="font-body text-lg text-on-surface-variant leading-relaxed mb-8 pb-8 border-b border-outline/20">
            {{ article.excerpt }}
          </p>

          <!-- Body (rendered as markdown via simple transform) -->
          <div
            v-if="article.body"
            class="prose prose-lg max-w-none font-body"
            v-html="renderMarkdown(article.body)"
          ></div>

          <!-- Back link -->
          <div class="mt-16 pt-8 border-t border-outline/20">
            <a href="/insights/" class="font-sans text-sm text-primary hover:text-secondary transition-colors tracking-wide">
              ← Back to Insights
            </a>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  slug?: string
}>()

// Read slug from URL pathname if not passed as prop
const effectiveSlug = computed(() => {
  if (props.slug) return props.slug
  // Parse /insights/{slug}/ from window.location
  if (typeof window !== 'undefined') {
    const match = window.location.pathname.match(/^\/insights\/([^/]+)/)
    if (match) return match[1]
  }
  return ''
})

interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  body: string
  category: string
  image_url: string
  author_id: string
  read_time_minutes: number
  status: string
  published_at: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const article = ref<Article | null>(null)

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function renderMarkdown(md: string): string {
  // Simple Markdown-to-HTML renderer for article display
  // Covers: headings, bold, italic, links, paragraphs, horizontal rules
  let html = md
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-outline/20" />')

    // Headings (h2, h3)
    .replace(/^### (.+)$/gm, '<h3 class="font-serif text-2xl text-on-surface mt-10 mb-4">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-serif text-3xl text-on-surface mt-12 mb-4">$1</h2>')

    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-surface-container px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-secondary underline underline-offset-2">$1</a>')

    // Lists (simple unordered)
    .replace(/^- (.+)$/gm, '<li class="text-on-surface-variant ml-6 list-disc">$1</li>')

    // Paragraphs — wrap non-empty, non-tag lines
    .split('\n')
    .map(line => {
      const trimmed = line.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('<')) return line
      if (trimmed.startsWith('*') && trimmed.endsWith('*')) return line
      return `<p class="text-on-surface-variant leading-relaxed mb-4">${trimmed}</p>`
    })
    .join('\n')

  return html
}

onMounted(async () => {
  try {
    const res = await fetch(`/api/articles/${effectiveSlug.value}`)
    if (!res.ok) {
      if (res.status === 404) throw new Error('Article not found')
      throw new Error(`HTTP ${res.status}`)
    }
    const data = await res.json()
    article.value = data.article || null
    if (!article.value) throw new Error('Article not found')

    // Update page title
    if (typeof document !== 'undefined') {
      document.title = `${article.value.title} | Paradigm IT Services`
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load article'
  } finally {
    loading.value = false
  }
})
</script>

<style>
/* Prose-like styling for article body */
.prose h2 {
  font-family: var(--font-headline, 'Instrument Serif', Georgia, serif);
  font-size: 1.875rem;
  color: var(--color-on-surface, #1a1a1a);
  margin-top: 3rem;
  margin-bottom: 1rem;
}

.prose h3 {
  font-family: var(--font-headline, 'Instrument Serif', Georgia, serif);
  font-size: 1.5rem;
  color: var(--color-on-surface, #1a1a1a);
  margin-top: 2.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  font-family: var(--font-body, 'Switzer', system-ui, sans-serif);
  color: var(--color-on-surface-variant, #5a5a5a);
  line-height: 1.75;
  margin-bottom: 1rem;
}

.prose strong {
  color: var(--color-on-surface, #1a1a1a);
}

.prose a {
  color: var(--color-primary, #a33900);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose a:hover {
  color: var(--color-secondary, #006a68);
}

.prose ul {
  margin-bottom: 1rem;
}

.prose li {
  color: var(--color-on-surface-variant, #5a5a5a);
  margin-left: 1.5rem;
  list-style-type: disc;
  margin-bottom: 0.25rem;
}

.prose code {
  background: var(--color-surface-container, #edeeef);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'Space Grotesk', 'SF Mono', monospace;
}
</style>
