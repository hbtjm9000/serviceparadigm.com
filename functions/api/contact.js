/**
 * POST /api/contact — Contact form submission
 * Writes to D1 with write-first logging, forwards email via Resend.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const { name, email, company, service, message, ...utm } = body;

    // Write-first: log the transaction
    const { meta } = await env.DB.prepare(`
      INSERT INTO transaction_log
        (request_id, endpoint, method, request_body, request_headers, status, created_at)
      VALUES (?, '/api/contact', 'POST', ?, ?, 'pending', datetime('now'))
    `).bind(requestId, JSON.stringify(body), JSON.stringify(Object.fromEntries(request.headers))).run();

    const logId = meta.last_row_id;

    // Send email via Resend if configured
    if (env.RESEND_API_KEY && env.CONTACT_EMAIL_TO) {
      const emailBody = [
        `Name: ${name ?? ''}`,
        `Email: ${email ?? ''}`,
        `Company: ${company ?? ''}`,
        `Service: ${service ?? ''}`,
        `Message: ${message ?? ''}`,
        `---`,
        `Request ID: ${requestId}`,
        `UTM: ${JSON.stringify(utm)}`,
      ].join('\n');

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contact@serviceparadigm.com',
          to: env.CONTACT_EMAIL_TO,
          subject: `New Contact: ${name ?? 'Unknown'}`,
          text: emailBody,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Email send failed: ${res.status} ${errText}`);
      }
    }

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
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
