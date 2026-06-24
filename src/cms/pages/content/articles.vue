<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Articles</h2>
        <p class="text-sm text-gray-500 mt-1">Manage blog articles for the Insights section</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Article
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p class="mt-4 text-gray-500">Loading articles...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Failed to load articles</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="articles.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No articles yet</h3>
      <p class="mt-2 text-sm text-gray-500">Create your first article to get started.</p>
      <button
        @click="showCreateModal = true"
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Create Article
      </button>
    </div>

    <!-- Articles Table -->
    <div v-else class="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="article in articles" :key="article.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ article.title }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <code class="text-xs text-gray-500">{{ article.slug }}</code>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="statusClass(article.status)"
              >
                {{ article.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ article.category || '—' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ article.author_id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ article.published_at ? formatDate(article.published_at) : '—' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="editArticle(article)" class="text-blue-600 hover:text-blue-800 mr-3">
                Edit
              </button>
              <button @click="deleteArticle(article)" class="text-red-600 hover:text-red-800">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingArticle"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingArticle ? 'Edit Article' : 'New Article' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Title *</label>
              <input
                v-model="form.title"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Article title"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Slug *</label>
              <input
                v-model="form.slug"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="article-url-slug"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Excerpt</label>
            <textarea
              v-model="form.excerpt"
              rows="2"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Brief summary for the article card"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Body (Markdown)</label>
            <textarea
              v-model="form.body"
              rows="10"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
              placeholder="Full article content in Markdown..."
            ></textarea>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Category</label>
              <input
                v-model="form.category"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g. AI Strategy"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                v-model="form.image_url"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="/images/hero.jpg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Author ID</label>
              <input
                v-model="form.author_id"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="hal"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select
                v-model="form.status"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Read Time (min)</label>
              <input
                v-model="form.read_time_minutes"
                type="number"
                min="1"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="saveArticle"
            :disabled="saving"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

interface Article {
  id?: number
  slug: string
  title: string
  excerpt?: string
  body?: string
  category?: string
  image_url?: string
  author_id: string
  read_time_minutes?: number
  status: string
  published_at?: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)
const articles = ref<Article[]>([])
const showCreateModal = ref(false)
const editingArticle = ref<Article | null>(null)

const form = reactive({
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  category: '',
  image_url: '',
  author_id: 'hal',
  read_time_minutes: 5,
  status: 'draft',
})

function statusClass(status?: string) {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800'
    case 'draft': return 'bg-yellow-100 text-yellow-800'
    case 'archived': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function closeModal() {
  showCreateModal.value = false
  editingArticle.value = null
  form.slug = ''
  form.title = ''
  form.excerpt = ''
  form.body = ''
  form.category = ''
  form.image_url = ''
  form.author_id = 'hal'
  form.read_time_minutes = 5
  form.status = 'draft'
}

function editArticle(article: Article) {
  editingArticle.value = article
  form.slug = article.slug
  form.title = article.title
  form.excerpt = article.excerpt || ''
  form.body = article.body || ''
  form.category = article.category || ''
  form.image_url = article.image_url || ''
  form.author_id = article.author_id
  form.read_time_minutes = article.read_time_minutes || 5
  form.status = article.status
}

async function loadArticles() {
  loading.value = true
  error.value = null

  try {
    const res = await fetch('/api/admin/articles')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    articles.value = data.articles || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load articles'
  } finally {
    loading.value = false
  }
}

async function saveArticle() {
  if (!form.title || !form.slug) {
    alert('Title and slug are required')
    return
  }

  saving.value = true

  try {
    const body = { ...form }
    const url = editingArticle.value
      ? `/api/admin/articles/${editingArticle.value.id}`
      : '/api/admin/articles'
    const method = editingArticle.value ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (data.ok) {
      closeModal()
      await loadArticles()
    } else {
      alert(data.error || 'Failed to save article')
    }
  } catch (err) {
    alert('Failed to save article')
  } finally {
    saving.value = false
  }
}

async function deleteArticle(article: Article) {
  if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return

  try {
    const res = await fetch(`/api/admin/articles/${article.id}`, {
      method: 'DELETE',
    })

    const data = await res.json()

    if (data.ok) {
      await loadArticles()
    } else {
      alert(data.error || 'Failed to delete article')
    }
  } catch (err) {
    alert('Failed to delete article')
  }
}

onMounted(loadArticles)
</script>
