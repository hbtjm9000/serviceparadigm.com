# Blogging / Insights — Architecture

**Last updated:** 2026-06-23
**Status:** Active ground truth

## Overview

The Insights section (URL: `/insights/`) is a content-managed blog. Articles are stored in Cloudflare D1 and served via the Worker API. The CMS admin panel provides CRUD. The public page loads dynamically from the API.

## Data Model

### D1 Table: `articles`

```sql
CREATE TABLE articles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  excerpt         TEXT,
  body            TEXT,
  category        TEXT,
  image_url       TEXT,
  author_id       TEXT NOT NULL DEFAULT 'hal',
  read_time_minutes INTEGER DEFAULT 5,
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK(status IN ('draft', 'published', 'archived')),
  published_at    TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(published_at) WHERE status = 'published';
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Auto-increment PK |
| `slug` | TEXT | URL-safe identifier (unique) |
| `title` | TEXT | Article headline |
| `excerpt` | TEXT | Short summary (shown in list cards) |
| `body` | TEXT | Full article content (Markdown) |
| `category` | TEXT | Category tag (e.g. "Systems Engineering", "AI Strategy") |
| `image_url` | TEXT | Hero image path (relative, e.g. `/images/cloud-engineering.jpg`) |
| `author_id` | TEXT | Internal author identifier (e.g. "hal", "riki") |
| `read_time_minutes` | INTEGER | Estimated read time |
| `status` | TEXT | `draft` | `published` | `archived` |
| `published_at` | TEXT | ISO datetime when status changed to published |
| `created_at` | TEXT | Auto-set on INSERT |
| `updated_at` | TEXT | Auto-set on INSERT and UPDATE |

## API Routes

### Public (no auth)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/articles` | List published articles (ordered by published_at DESC) |
| GET | `/api/articles/{slug}` | Get single published article by slug |

### Admin (auth required — session cookie)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/articles` | List all articles (all statuses) |
| GET | `/api/admin/articles/{id}` | Get article by ID |
| POST | `/api/admin/articles` | Create article |
| PUT | `/api/admin/articles/{id}` | Update article |
| DELETE | `/api/admin/articles/{id}` | Delete article |

### Response Format

All API responses follow:

```json
{
  "ok": true,
  "article": { ... },          // single article
  "articles": [ ... ],         // list
  "request_id": "uuid"
}
```

Error responses:

```json
{
  "ok": false,
  "error": "message"
}
```

## Architecture Flow

```
Browser ──→ GET /insights/
              │
              ▼
         Cloudflare Worker
              │
         ┌────┴────┐
         │         │
    ASSETS      GET /api/articles
    (Astro      (pass through)
     build)        │
         │         ▼
         │     D1 SELECT ... WHERE status='published'
         │         │
         │         ▼
         │    JSON response → Vue component renders cards
         │
         └────┬────┘
         served page with
         dynamic content

CMS Admin:
  Browser ──→ /internala/#/content/articles
                │
           auth check (session cookie)
                │
           GET/POST/PUT/DELETE /api/admin/articles/*
                │
           D1 CRUD
```

## Content Pipeline

Two paths for content to appear:

1. **Admin CMS** — Author writes in-browser form → API → D1 → published
2. **Direct DB insert** — Migration scripts, automated imports from email pipeline

Images are stored in `public/images/` (Astro static assets) and referenced by relative path in `image_url`.

## Security

- Admin article endpoints are behind `protectInternalRoute()` — same session auth as the rest of the CMS
- Public GET endpoints are open
- Articles in `draft` or `archived` status are never exposed via public endpoints
- `author_id` tracks who created/modified; stored internally only
