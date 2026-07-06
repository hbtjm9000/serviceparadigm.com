-- Migration 0002: Add sort_order and is_pinned to articles
ALTER TABLE articles ADD COLUMN sort_order INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN is_pinned INTEGER DEFAULT 0 CHECK(is_pinned IN (0, 1));

-- Update existing articles with default sort order (by published_at)
UPDATE articles SET sort_order = 0, is_pinned = 0 WHERE sort_order IS NULL;
