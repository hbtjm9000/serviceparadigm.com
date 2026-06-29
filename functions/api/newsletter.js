/**
 * POST /api/newsletter — Newsletter signup
 * Stores subscriber in D1 with UTM tracking.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ ok: false, error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Write-first: log transaction
    const { meta } = await env.DB.prepare(`
      INSERT INTO transaction_log
        (request_id, endpoint, method, request_body, request_headers, status, created_at)
      VALUES (?, '/api/newsletter', 'POST', ?, ?, 'pending', datetime('now'))
    `).bind(requestId, JSON.stringify(body), JSON.stringify(Object.fromEntries(request.headers))).run();

    const logId = meta.last_row_id;

    // Insert subscriber
    await env.DB.prepare(`
      INSERT INTO subscribers (email, source, status, utm_source, utm_medium, utm_campaign)
      VALUES (?, 'newsletter', 'active', ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        status = 'active', updated_at = datetime('now')
    `).bind(
      email,
      body.utm_source || null,
      body.utm_medium || null,
      body.utm_campaign || null
    ).run();

    // Mark success
    await env.DB.prepare(`
      UPDATE transaction_log SET status = 'success', response_body = ?, completed_at = datetime('now')
      WHERE id = ?
    `).bind(JSON.stringify({ ok: true }), logId).run();

    return new Response(JSON.stringify({ ok: true, request_id: requestId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
