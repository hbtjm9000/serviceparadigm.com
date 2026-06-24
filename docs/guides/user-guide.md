# Insights / Blog — User Guide (Frontend)

**Last updated:** 2026-06-23

## Overview

The Insights section at `/insights/` displays published articles from Paradigm IT Services. Articles cover technical briefs, white papers, strategic analysis, and industry perspectives.

## For Visitors

### List Page (`/insights/`)

- **Featured article** — The most recent published article appears as a hero card at the top with full-width image, category, date, and excerpt
- **Article grid** — Remaining articles display in a responsive 3-column grid (2-column on tablet, 1 on mobile)
- Each card shows:
  - Category badge
  - Publish date
  - Title
  - Excerpt (3-line clamp on grid)
  - Estimated read time
  - "Read →" link

### Article Detail Page (`/insights/{slug}/`)

Each published article has a dedicated detail page. The page includes:
- Hero image
- Category + date + read time
- Full article title
- Article body (rendered Markdown)

### Sharing

- Article URLs follow the format `serviceparadigm.com/insights/{slug}/`
- Open Graph meta tags are set for link previews
- Share the URL directly — no built-in social share widgets

## For Content Authors

### Publishing Workflow

1. Draft the article in a text editor or directly in the CMS admin
2. Upload any images via the existing project asset pipeline (`public/images/`)
3. Log in to the admin panel at `/internala/login`
4. Navigate to Content → Articles
5. Click "New Article" to create or click an existing article to edit
6. Set status to "Published" when ready
7. The article appears on `/insights/` immediately

### Article Fields

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Keep under 60 chars for SEO |
| Slug | Yes | URL-safe, auto-generated from title (editable) |
| Excerpt | Yes | 1-2 sentence summary for list cards |
| Body | No | Full content (Markdown supported) |
| Category | No | E.g. "Systems Engineering", "AI Strategy" |
| Image URL | No | Path to hero image |
| Author ID | Yes | Internal identifier (set to your assigned ID) |
| Read Time | No | Auto-calculated from body length, overridable |
| Status | Yes | Draft → Published → Archived |

### URL Convention

- Slug should be kebab-case: `cloud-arrays-edge-logic`
- No trailing slash in the slug
- Max 80 characters
- Must be unique

### Image Guidelines

- Store images in `public/images/`
- Reference by relative path: `/images/my-article-hero.jpg`
- Prefer 16:10 aspect ratio (800×500px or 1600×1000px)
- Optimize for web (compress JPEG/WebP, keep under 200KB)
