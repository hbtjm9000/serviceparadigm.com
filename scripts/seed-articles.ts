/**
 * Seed articles into D1 — run once after migration 0002.
 * Usage: bun run scripts/seed-articles.ts
 *
 * Requires wrangler to be authenticated and D1 binding available locally.
 * Or: copy SQL output and run via `wrangler d1 execute serviceparadigm-db`
 */

const articles = [
  {
    slug: 'blog-1-chatbot-vs-agent',
    title: 'Beyond the Chatbot: What Actually Counts as an AI Agent?',
    excerpt: 'Most things called AI agents are chatbots with premium price tags. Here\'s the diagnostic to tell the difference, and what actually makes an agent work.',
    category: 'Series \u2014 AI Agents',
    read_time_minutes: 10,
    sort_order: 2,
    is_pinned: 0,
    status: 'published',
    published_at: '2026-07-06T10:00:00Z',
  },
  {
    slug: 'blog-2-three-percent-problem',
    title: 'The 3% Problem: Why 86% of Enterprise Agent Pilots Fail',
    excerpt: 'The models crossed the threshold in late 2025. The bottleneck shifted — and most organizations are still failing at the architecture layer.',
    category: 'Series \u2014 AI Agents',
    read_time_minutes: 10,
    sort_order: 3,
    is_pinned: 0,
    status: 'published',
    published_at: '2026-07-06T11:00:00Z',
  },
  {
    slug: 'blog-3-which-species',
    title: 'Which Species for Which Job? Mapping Agent Architectures',
    excerpt: 'Not all L3 agents are the same. Deploying the wrong architecture guarantees failure regardless of the model.',
    category: 'Series \u2014 AI Agents',
    read_time_minutes: 8,
    sort_order: 4,
    is_pinned: 0,
    status: 'published',
    published_at: '2026-07-06T12:00:00Z',
  },
  {
    slug: 'blog-4-stack-ownership',
    title: 'Stop Renting Your AI. Own the Stack.',
    excerpt: 'If your agent infrastructure relies on a single vendor\'s model, memory, and toolchain, you don\'t own your deployment. You\'re renting it.',
    category: 'Series \u2014 AI Agents',
    read_time_minutes: 8,
    sort_order: 5,
    is_pinned: 0,
    status: 'published',
    published_at: '2026-07-06T13:00:00Z',
  },
  {
    slug: 'ai-position-piece',
    title: 'AI Is Not the Next Industrial Revolution',
    excerpt: 'Every previous revolution replaced physical labor. This one replaces reasoning itself. We have agency \u2014 but the window is closing.',
    category: 'Position',
    read_time_minutes: 8,
    sort_order: 1,
    is_pinned: 1,
    status: 'published',
    published_at: '2026-07-06T14:00:00Z',
  },
];

// Generate INSERT statements
for (const a of articles) {
  console.log(`INSERT INTO articles (slug, title, excerpt, category, read_time_minutes, sort_order, is_pinned, status, published_at)
VALUES ('${a.slug}', '${a.title.replace(/'/g, "''")}', '${a.excerpt.replace(/'/g, "''")}', '${a.category}', ${a.read_time_minutes}, ${a.sort_order}, ${a.is_pinned}, 'published', '${a.published_at}')
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  read_time_minutes = excluded.read_time_minutes,
  sort_order = excluded.sort_order,
  is_pinned = excluded.is_pinned,
  status = 'published';`);
}
