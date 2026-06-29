/**
 * GET /api/articles — List published articles
 * GET /api/articles/:slug — Get single article
 *
 * Cloudflare Pages Functions handle parameterized paths via [[path]].js
 * where the matched path is available in context.params.path.
 */
export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = params.path || '';

  try {
    // Single article by slug: /api/articles/some-slug
    if (path && !path.includes('/')) {
      const slug = path;
      const { results } = await env.DB.prepare(`
        SELECT * FROM articles
        WHERE slug = ? AND status = 'published'
        LIMIT 1
      `).bind(slug).all();

      if (!results || results.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: 'Article not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ ok: true, article: results[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // List all published articles
    const { results } = await env.DB.prepare(`
      SELECT id, slug, title, excerpt, category, image_url, author_id,
             read_time_minutes, published_at
      FROM articles
      WHERE status = 'published'
      ORDER BY published_at DESC
    `).all();

    return new Response(JSON.stringify({ ok: true, articles: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
