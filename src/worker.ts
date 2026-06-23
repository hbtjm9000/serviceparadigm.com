/// <reference types="@cloudflare/workers-types" />

/**
 * serviceparadigm.com — Cloudflare Worker
 *
 * Static asset serving + write-first transaction-logged API endpoints.
 * Every API call is INSERTed into D1 before execution (write-first),
 * then UPDATEd to success/failed. Failed transactions are replayable.
 *
 * Admin routes (/internala/*) are protected by session-based auth
 * (password + PIN two-factor).
 */

// ── Write-first transaction logging ──────────────────────────────────────

interface Transaction {
  requestId: string
  endpoint: string
  method: string
  body: unknown
  headers: Record<string, string>
  cfCountry?: string
  cfIp?: string
}

async function logBegin(db: D1Database, tx: Transaction): Promise<number> {
  const { meta } = await db.prepare(`
    INSERT INTO transaction_log
      (request_id, endpoint, method, request_body, request_headers,
       cf_country, cf_ip, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `).bind(
    tx.requestId,
    tx.endpoint,
    tx.method,
    JSON.stringify(tx.body),
    JSON.stringify(tx.headers),
    tx.cfCountry ?? null,
    tx.cfIp ?? null,
  ).run()
  return meta.last_row_id
}

async function logSuccess(
  db: D1Database,
  logId: number,
  responseBody: unknown,
): Promise<void> {
  await db.prepare(`
    UPDATE transaction_log
    SET status = 'success', response_body = ?, completed_at = datetime('now')
    WHERE id = ?
  `).bind(JSON.stringify(responseBody), logId).run()
}

async function logFailed(
  db: D1Database,
  logId: number,
  error: string,
): Promise<void> {
  await db.prepare(`
    UPDATE transaction_log
    SET status = 'failed', error = ?, completed_at = datetime('now')
    WHERE id = ?
  `).bind(error, logId).run()
}

// ── Request helpers ──────────────────────────────────────────────────────

function requestId(): string {
  return crypto.randomUUID()
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

// ── GrowthBook / Feature flag helper ──────────────────────────────────────

function isFeatureEnabled(env: Env, flag: string): boolean {
  switch (flag) {
    case 'order-form-enabled':
      return env.FEATURE_ORDER_ENABLED === 'true'
    default:
      return true
  }
}

// ── Admin Auth (password + PIN two-factor) ───────────────────────────────

const AUTH_COOKIE = 'pit_admin_session'
const SESSION_DURATION = 4 * 60 * 60 // 4 hours

function generateSessionId(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function setSessionCookie(sessionId: string): string {
  const expires = new Date(Date.now() + SESSION_DURATION * 1000).toUTCString()
  return `${AUTH_COOKIE}=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expires}`
}

function clearSessionCookie(): string {
  return `${AUTH_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

function parseCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=')
    if (eq > 0 && part.substring(0, eq).trim() === name) {
      return part.substring(eq + 1).trim()
    }
  }
  return null
}

async function handleAuthCheck(request: Request, env: Env): Promise<Response> {
  const cookie = parseCookie(request, AUTH_COOKIE)
  if (!cookie) return json({ authenticated: false }, 401)

  const { results } = await env.DB.prepare(
    'SELECT 1 FROM admin_sessions WHERE session_id = ? AND expires_at > datetime(\'now\')'
  ).bind(cookie).all()

  return results && results.length > 0
    ? json({ authenticated: true })
    : json({ authenticated: false }, 401)
}

async function handleAdminLogin(request: Request, env: Env): Promise<Response> {
  try {
    const body: { password?: string; pin?: string } = await request.json()

    // Validate password + PIN against env vars
    const validPassword = env.ADMIN_PASSWORD && body.password === env.ADMIN_PASSWORD
    const validPin = env.ADMIN_PIN && body.pin === env.ADMIN_PIN

    if (!validPassword || !validPin) {
      return json({ ok: false, error: 'Invalid credentials' }, 401)
    }

    // Create session
    const sessionId = generateSessionId()
    const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000).toISOString()

    await env.DB.prepare(
      'INSERT INTO admin_sessions (session_id, created_at, expires_at) VALUES (?, datetime(\'now\'), ?)'
    ).bind(sessionId, expiresAt).run()

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setSessionCookie(sessionId),
      },
    })
  } catch (err) {
    return json({ ok: false, error: 'Invalid request' }, 400)
  }
}

async function handleAdminLogout(request: Request, env: Env): Promise<Response> {
  const cookie = parseCookie(request, AUTH_COOKIE)
  if (cookie) {
    await env.DB.prepare('DELETE FROM admin_sessions WHERE session_id = ?').bind(cookie).run()
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Set-Cookie': clearSessionCookie(), 'Content-Type': 'application/json' },
  })
}

/** Protect /internala/* routes — redirect to login if no valid session */
async function protectInternalRoute(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url)
  if (!url.pathname.startsWith('/internala/')) return null

  // Allow login page and API auth endpoints
  if (url.pathname === '/internala/login' || url.pathname.startsWith('/internala/login')) return null

  const cookie = parseCookie(request, AUTH_COOKIE)
  if (!cookie) {
    return Response.redirect(new URL('/internala/login', request.url).toString(), 302)
  }

  const { results } = await env.DB.prepare(
    'SELECT 1 FROM admin_sessions WHERE session_id = ? AND expires_at > datetime(\'now\')'
  ).bind(cookie).all()

  if (!results || results.length === 0) {
    return Response.redirect(new URL('/internala/login', request.url).toString(), 302)
  }

  return null // Allow through
}

// ── API Handlers ─────────────────────────────────────────────────────────

async function handleContact(request: Request, env: Env): Promise<Response> {
  const cf = (request as any).cf as { country?: string; asOrganization?: string } | undefined
  const tx: Transaction = {
    requestId: requestId(),
    endpoint: '/api/contact',
    method: request.method,
    body: await request.clone().json(),
    headers: Object.fromEntries(request.headers),
    cfCountry: cf?.country,
    cfIp: cf?.asOrganization,
  }

  let logId = 0
  try {
    logId = await logBegin(env.DB, tx)

    if (env.RESEND_API_KEY && env.CONTACT_EMAIL_TO) {
      const body = tx.body as Record<string, unknown>
      const emailBody = `
        Name: ${body.name ?? ''}
        Email: ${body.email ?? ''}
        Company: ${body.company ?? ''}
        Service: ${body.service ?? ''}
        Message: ${body.message ?? ''}
        ---
        Request ID: ${tx.requestId}
      `
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contact@serviceparadigm.com',
          to: env.CONTACT_EMAIL_TO,
          subject: `New Contact: ${body.name ?? 'Unknown'}`,
          text: emailBody,
        }),
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Email send failed: ${res.status} ${errText}`)
      }
    }

    const response = { ok: true, request_id: tx.requestId }
    await logSuccess(env.DB, logId, response)
    return json(response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (logId > 0) await logFailed(env.DB, logId, msg)
    return json({ ok: false, error: msg }, 500)
  }
}

async function handleNewsletter(request: Request, env: Env): Promise<Response> {
  const cf = (request as any).cf as { country?: string; asOrganization?: string } | undefined
  const tx: Transaction = {
    requestId: requestId(),
    endpoint: '/api/newsletter',
    method: request.method,
    body: await request.clone().json(),
    headers: Object.fromEntries(request.headers),
    cfCountry: cf?.country,
    cfIp: cf?.asOrganization,
  }

  let logId = 0
  try {
    logId = await logBegin(env.DB, tx)
    const { email } = tx.body as { email?: string }

    if (!email || !email.includes('@')) {
      throw new Error('Valid email required')
    }

    await env.DB.prepare(`
      INSERT INTO subscribers (email, source, status)
      VALUES (?, 'newsletter', 'active')
      ON CONFLICT(email) DO UPDATE SET
        status = 'active',
        updated_at = datetime('now')
    `).bind(email).run()

    const response = { ok: true, request_id: tx.requestId }
    await logSuccess(env.DB, logId, response)
    return json(response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (logId > 0) await logFailed(env.DB, logId, msg)
    return json({ ok: false, error: msg }, 400)
  }
}

async function handleOrder(request: Request, env: Env): Promise<Response> {
  if (!isFeatureEnabled(env, 'order-form-enabled')) {
    return json({ ok: false, error: 'Order form is disabled' }, 403)
  }

  const cf = (request as any).cf as { country?: string; asOrganization?: string } | undefined
  const tx: Transaction = {
    requestId: requestId(),
    endpoint: '/api/order',
    method: request.method,
    body: await request.clone().json(),
    headers: Object.fromEntries(request.headers),
    cfCountry: cf?.country,
    cfIp: cf?.asOrganization,
  }

  let logId = 0
  try {
    logId = await logBegin(env.DB, tx)
    const body = tx.body as {
      items?: Array<{ id: string; name: string; price: number; qty: number }>
      total?: number
      customer?: { name: string; email: string; phone?: string; company?: string; notes?: string }
    }

    if (!body.customer?.name || !body.customer?.email) {
      throw new Error('Customer name and email required')
    }
    if (!body.items || body.items.length === 0) {
      throw new Error('Cart is empty')
    }

    const orderRef = 'ORD-' + Date.now().toString(36).toUpperCase()
    const totalCents = Math.round((body.total ?? 0) * 100)

    await env.DB.prepare(`
      INSERT INTO orders
        (order_ref, customer_name, customer_email, customer_phone,
         customer_company, items, total_cents, currency, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'USD', ?, 'pending')
    `).bind(
      orderRef,
      body.customer.name,
      body.customer.email,
      body.customer.phone ?? null,
      body.customer.company ?? null,
      JSON.stringify(body.items),
      totalCents,
      body.customer.notes ?? null,
    ).run()

    const response = {
      ok: true,
      request_id: tx.requestId,
      order_ref: orderRef,
      total: body.total,
    }
    await logSuccess(env.DB, logId, response)
    return json(response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (logId > 0) await logFailed(env.DB, logId, msg)
    return json({ ok: false, error: msg }, 400)
  }
}

async function handleTransactionList(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const statusFilter = url.searchParams.get('status') ?? ''
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 200)

  let rows: unknown[]
  if (statusFilter) {
    const { results } = await env.DB.prepare(`
      SELECT id, request_id, endpoint, method, status, error,
             substr(request_body, 1, 200) as request_preview,
             created_at, completed_at
      FROM transaction_log
      WHERE status = ?
      ORDER BY id DESC
      LIMIT ?
    `).bind(statusFilter, limit).all()
    rows = results
  } else {
    const { results } = await env.DB.prepare(`
      SELECT id, request_id, endpoint, method, status, error,
             substr(request_body, 1, 200) as request_preview,
             created_at, completed_at
      FROM transaction_log
      ORDER BY id DESC
      LIMIT ?
    `).bind(limit).all()
    rows = results
  }

  return json({ transactions: rows })
}

async function handleReplay(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const logId = parseInt(url.searchParams.get('id') ?? '0', 10)
  if (!logId) return json({ error: 'Missing ?id=' }, 400)

  const { results } = await env.DB.prepare(`
    SELECT id, request_body, endpoint, method, request_headers
    FROM transaction_log WHERE id = ?
  `).bind(logId).all()

  if (!results || results.length === 0) {
    return json({ error: 'Transaction not found' }, 404)
  }

  const tx = results[0] as unknown as {
    id: number; request_body: string; endpoint: string
    method: string; request_headers: string
  }

  return json({
    id: tx.id,
    endpoint: tx.endpoint,
    method: tx.method,
    body: JSON.parse(tx.request_body ?? '{}'),
    headers: JSON.parse(tx.request_headers ?? '{}'),
  })
}

// ── Router ───────────────────────────────────────────────────────────────

async function handleApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url)
  const path = url.pathname

  if (request.method === 'POST') {
    switch (path) {
      case '/api/contact': return handleContact(request, env)
      case '/api/newsletter': return handleNewsletter(request, env)
      case '/api/order': return handleOrder(request, env)
      case '/api/admin/login': return handleAdminLogin(request, env)
      case '/api/admin/logout': return handleAdminLogout(request, env)
    }
  }

  if (request.method === 'GET') {
    switch (path) {
      case '/api/health':
        return json({ ok: true, env: 'production', ts: new Date().toISOString() })
      case '/api/admin/transactions':
        return handleTransactionList(request, env)
      case '/api/admin/replay':
        return handleReplay(request, env)
      case '/api/admin/check':
        return handleAuthCheck(request, env)
    }
  }

  return null
}

// ── Main entry ───────────────────────────────────────────────────────────

export interface Env {
  /** Static assets binding from Astro build */
  ASSETS: Fetcher
  /** D1 database for transaction log + business data */
  DB: D1Database
  /** Feature flag: enable/disable order form */
  FEATURE_ORDER_ENABLED?: string
  /** Email forwarding (Resend API key — optional) */
  RESEND_API_KEY?: string
  /** Contact form forwarding address */
  CONTACT_EMAIL_TO?: string
  /** GrowthBook client key for server-side flag eval (optional) */
  GROWTHBOOK_CLIENT_KEY?: string
  /** Admin password (set in Cloudflare dashboard) */
  ADMIN_PASSWORD?: string
  /** Admin PIN (second factor, set in Cloudflare dashboard) */
  ADMIN_PIN?: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Protect internal routes (redirect to login if no session)
      const protectResponse = await protectInternalRoute(request, env)
      if (protectResponse) return protectResponse

      // Handle API routes
      const apiResponse = await handleApi(request, env)
      if (apiResponse) return apiResponse

      // Serve static assets (default — Astro build output)
      return env.ASSETS.fetch(request)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return json({ error: 'Internal error', detail: msg }, 500)
    }
  },
}
