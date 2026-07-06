INSERT INTO articles (slug, title, excerpt, category, read_time_minutes, sort_order, is_pinned, status, published_at)
VALUES ('blog-1-chatbot-vs-agent', 'Beyond the Chatbot: What Actually Counts as an AI Agent?', 'Most things called AI agents are chatbots with premium price tags. Here''s the diagnostic to tell the difference, and what actually makes an agent work.', 'Series — AI Agents', 10, 2, 0, 'published', '2026-07-06T10:00:00Z')
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  read_time_minutes = excluded.read_time_minutes,
  sort_order = excluded.sort_order,
  is_pinned = excluded.is_pinned,
  status = 'published';

INSERT INTO articles (slug, title, excerpt, category, read_time_minutes, sort_order, is_pinned, status, published_at)
VALUES ('blog-2-three-percent-problem', 'The 3% Problem: Why 86% of Enterprise Agent Pilots Fail', 'The models crossed the threshold in late 2025. The bottleneck shifted — and most organizations are still failing at the architecture layer.', 'Series — AI Agents', 10, 3, 0, 'published', '2026-07-06T11:00:00Z')
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  read_time_minutes = excluded.read_time_minutes,
  sort_order = excluded.sort_order,
  is_pinned = excluded.is_pinned,
  status = 'published';

INSERT INTO articles (slug, title, excerpt, category, read_time_minutes, sort_order, is_pinned, status, published_at)
VALUES ('blog-3-which-species', 'Which Species for Which Job? Mapping Agent Architectures', 'Not all L3 agents are the same. Deploying the wrong architecture guarantees failure regardless of the model.', 'Series — AI Agents', 8, 4, 0, 'published', '2026-07-06T12:00:00Z')
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  read_time_minutes = excluded.read_time_minutes,
  sort_order = excluded.sort_order,
  is_pinned = excluded.is_pinned,
  status = 'published';

INSERT INTO articles (slug, title, excerpt, category, read_time_minutes, sort_order, is_pinned, status, published_at)
VALUES ('blog-4-stack-ownership', 'Stop Renting Your AI. Own the Stack.', 'If your agent infrastructure relies on a single vendor''s model, memory, and toolchain, you don''t own your deployment. You''re renting it.', 'Series — AI Agents', 8, 5, 0, 'published', '2026-07-06T13:00:00Z')
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  read_time_minutes = excluded.read_time_minutes,
  sort_order = excluded.sort_order,
  is_pinned = excluded.is_pinned,
  status = 'published';

INSERT INTO articles (slug, title, excerpt, category, read_time_minutes, sort_order, is_pinned, status, published_at)
VALUES ('ai-position-piece', 'AI Is Not the Next Industrial Revolution', 'Every previous revolution replaced physical labor. This one replaces reasoning itself. We have agency — but the window is closing.', 'Position', 8, 1, 1, 'published', '2026-07-06T14:00:00Z')
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  read_time_minutes = excluded.read_time_minutes,
  sort_order = excluded.sort_order,
  is_pinned = excluded.is_pinned,
  status = 'published';
