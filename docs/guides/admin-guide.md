# Insights / Blog — Admin Guide (Backend)

**Last updated:** 2026-06-23

## Overview

The blog CMS is a Vue 3 SPA served under `/internala/`. All admin operations route through the Cloudflare Worker API, which validates session auth before touching D1.

## Authentication

Access the admin panel at `/internala/login`.

Login requires two factors:
1. **Password** — configured via `ADMIN_PASSWORD` environment variable in Cloudflare Dashboard
2. **PIN** — configured via `ADMIN_PIN` environment variable

Sessions expire after 4 hours. Session data is stored in the D1 `admin_sessions` table with HttpOnly, Secure cookies.

Logout: click the logout action or navigate to `/api/admin/logout`.

## Managing Articles

### List View

Navigate to Content → Articles (`/internala/#/content/articles`).

The list shows all articles regardless of status (draft, published, archived). Columns:
- Title
- Slug
- Status badge (draft/yellow, published/green, archived/gray)
- Category
- Author
- Published date
- Actions (Edit, Delete)

### Creating an Article (via API)

```
POST /api/admin/articles
Authorization: (session cookie)
Content-Type: application/json

{
  "slug": "my-article-slug",
  "title": "Article Title",
  "excerpt": "Brief summary...",
  "body": "Full markdown content...",
  "category": "Systems Engineering",
  "image_url": "/images/hero.jpg",
  "author_id": "hal",
  "read_time_minutes": 8,
  "status": "draft"
}
```

On success, the API returns the created article with its assigned `id` and timestamps.

### Updating an Article

```
PUT /api/admin/articles/{id}
{
  "title": "Updated Title",
  "status": "published",
  ...
}
```

Only provided fields are updated. The `updated_at` timestamp is set automatically.

When `status` changes to `"published"` and `published_at` is null, the API sets `published_at` to the current timestamp.

### Deleting an Article

```
DELETE /api/admin/articles/{id}
```

This is a hard delete from D1. There is no soft-delete recovery — use the `archived` status instead.

## Database Schema

The articles table lives in D1 alongside the existing `transaction_log`, `subscribers`, `orders`, and `admin_sessions` tables.

### Local Development

The `scripts/migrate-articles.ts` script creates the table in the local SQLite database for development testing:

```bash
cd ~/lab/serviceparadigm.com
bun run scripts/migrate-articles.ts
```

For production, the D1 migration is applied as part of the CI deploy pipeline:

```bash
bunx wrangler d1 migrations apply serviceparadigm-db
```

See `docs/architecture/blogging.md` for the full DDL.

## Troubleshooting

### Article not appearing on /insights/

1. Check status is `"published"` in the admin article list
2. Verify `published_at` has a value (API sets it automatically when publishing)
3. Check the browser console for API errors on the insights page
4. Verify the Worker deployed with the article API routes (redeploy if needed)

### CMS returns 401 on article operations

1. Session expired — re-login at `/internala/login`
2. Clear cookies for `serviceparadigm.com` and re-authenticate
3. Check that `ADMIN_PASSWORD` and `ADMIN_PIN` are set in Cloudflare Dashboard

### Article links return 404

Article detail pages are handled as dynamic routes. If the Worker is serving a stale static build, redeploy:
```bash
bun run build && bunx wrangler deploy
```

## CI/CD

The blogging feature does not change the deployment pipeline. Standard process:
1. Push to `fj main` triggers CI
2. CI runs: typecheck → lint → unit test → build
3. Deploy to staging (`serviceparadigm.stage.paradigm.local`)
4. After validation, merge promotion PR → production deploy

D1 migrations run automatically in CI before the deploy step.
