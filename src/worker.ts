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
  // D1 run() returns meta.last_row_id at runtime; cast for TS
  type D1RunResult = { meta: { last_row_id: number } }
  const { meta } = await (db.prepare(`
    INSERT INTO transaction_log
      (request_id, endpoint, method, request_body, request_headers,
       cf_country, cf_ip, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `).bind(
    tx.requestId, tx.endpoint, tx.method,
    JSON.stringify(tx.body || {}),
    JSON.stringify(tx.headers || {}),
    tx.cfCountry || null, tx.cfIp || null
  ).run() as unknown as Promise<D1RunResult>)
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
  if (url.pathname === '/internala/pending' || url.pathname.startsWith('/internala/pending')) return null

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

    // Lead captured in D1 — CRM pipeline handled separately
    // (transaction_log stores name, email, company, message, UTM params)

    const response = { success: true, request_id: tx.requestId }
    await logSuccess(env.DB, logId, response)
    return json(response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (logId > 0) await logFailed(env.DB, logId, msg)
    return json({ success: false, error: msg }, 500)
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

async function handleAppointmentRequest(request: Request, env: Env): Promise<Response> {
  const cf = (request as any).cf as { country?: string; asOrganization?: string } | undefined
  const tx: Transaction = {
    requestId: requestId(),
    endpoint: '/api/appointment-requests',
    method: request.method,
    body: await request.clone().json(),
    headers: Object.fromEntries(request.headers),
    cfCountry: cf?.country,
    cfIp: cf?.asOrganization,
  }

  let logId = 0
  try {
    logId = await logBegin(env.DB, tx)
    const { email, name, company, interest } = tx.body as {
      email?: string; name?: string; company?: string; interest?: string
    }

    if (!email || !email.includes('@')) throw new Error('Valid email required')
    if (!name || name.trim().length === 0) throw new Error('Name required')

    // Insert appointment request
    await env.DB.prepare(`
      INSERT INTO appointment_requests
        (email, name, company, interest, source,
         utm_source, utm_medium, utm_campaign,
         referral_code, discount_code, page_url, status)
      VALUES (?, ?, ?, ?, 'booking',
        ?, ?, ?,
        ?, ?, ?,
        'pending')
    `).bind(
      email, name, company || '', interest || '',
      tx.body?.utm_source || null,
      tx.body?.utm_medium || null,
      tx.body?.utm_campaign || null,
      tx.body?.referral_code || null,
      tx.body?.discount_code || null,
      tx.body?.page_url || null,
    ).run()

    // Also upsert into subscribers (unified contact list)
    await env.DB.prepare(`
      INSERT INTO subscribers (email, source, status, utm_source, utm_medium, utm_campaign)
      VALUES (?, 'booking', 'active', ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        source = CASE WHEN source = 'newsletter' THEN 'both' ELSE 'booking' END,
        updated_at = datetime('now')
    `).bind(
      email,
      tx.body?.utm_source || null,
      tx.body?.utm_medium || null,
      tx.body?.utm_campaign || null,
    ).run()

    const response = { ok: true, redirect: 'https://calendar.app.google/teRByg9wRAUZSYww5' }
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

// ── Article Interfaces ─────────────────────────────────────────────────────

interface Article {
  id?: number
  slug: string
  title: string
  excerpt?: string
  body?: string
  category?: string
  image_url?: string
  author_id: string
  read_time_minutes?: number
  sort_order?: number
  is_pinned?: number
  status?: 'draft' | 'published' | 'archived'
  published_at?: string
  created_at?: string
  updated_at?: string
}

// ── Public Article Handlers ────────────────────────────────────────────────

async function handleGetArticles(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)

  // Single article by slug
  const slugMatch = url.pathname.match(/^\/api\/articles\/([^/]+)$/)
  if (slugMatch) {
    const slug = slugMatch[1]
    const { results } = await env.DB.prepare(`
      SELECT * FROM articles
      WHERE slug = ? AND status = 'published'
      LIMIT 1
    `).bind(slug).all()

    const rows = results as unknown as Article[]
    if (!rows || rows.length === 0) {
      return json({ ok: false, error: 'Article not found' }, 404)
    }
    return json({ ok: true, article: rows[0] })
  }

  // List all published articles
  const { results } = await env.DB.prepare(`
    SELECT id, slug, title, excerpt, category, image_url, author_id,
           read_time_minutes, sort_order, is_pinned, published_at
    FROM articles
    WHERE status = 'published'
    ORDER BY is_pinned DESC, sort_order ASC, published_at DESC
  `).all()

  return json({ ok: true, articles: results as unknown as Article[] })
}

// ── Admin Article Handlers ─────────────────────────────────────────────────

async function handleAdminGetArticles(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)

  // Single article by ID
  const idMatch = url.pathname.match(/^\/api\/admin\/articles\/(\d+)$/)
  if (idMatch) {
    const id = parseInt(idMatch[1], 10)
    const { results } = await env.DB.prepare(
      'SELECT * FROM articles WHERE id = ?'
    ).bind(id).all()

    const rows = results as unknown as Article[]
    if (!rows || rows.length === 0) {
      return json({ ok: false, error: 'Article not found' }, 404)
    }
    return json({ ok: true, article: rows[0] })
  }

  // List all articles (all statuses)
  const statusFilter = url.searchParams.get('status') ?? ''
  let rows: unknown[]

  if (statusFilter) {
    const { results } = await env.DB.prepare(`
      SELECT * FROM articles WHERE status = ? ORDER BY updated_at DESC
    `).bind(statusFilter).all()
    rows = results
  } else {
    const { results } = await env.DB.prepare(`
      SELECT * FROM articles ORDER BY updated_at DESC
    `).all()
    rows = results
  }

  return json({ ok: true, articles: rows as unknown as Article[] })
}

async function handleAdminCreateArticle(request: Request, env: Env): Promise<Response> {
  try {
    const body: Article = await request.json()

    if (!body.slug || !body.title) {
      return json({ ok: false, error: 'slug and title are required' }, 400)
    }

    // Check slug uniqueness
    const { results: existing } = await env.DB.prepare(
      'SELECT 1 FROM articles WHERE slug = ?'
    ).bind(body.slug).all()

    if (existing && (existing as unknown[]).length > 0) {
      return json({ ok: false, error: 'Slug already exists' }, 409)
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const publishedAt = body.status === 'published' ? now : null

    type D1RunResult = { meta: { last_row_id: number } }
    const { meta } = await (env.DB.prepare(`
      INSERT INTO articles (slug, title, excerpt, body, category, image_url,
                            author_id, read_time_minutes, sort_order, is_pinned,
                            status, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.slug,
      body.title,
      body.excerpt ?? null,
      body.body ?? null,
      body.category ?? null,
      body.image_url ?? null,
      body.author_id ?? 'hal',
      body.read_time_minutes ?? 5,
      body.sort_order ?? 0,
      body.is_pinned ?? 0,
      body.status ?? 'draft',
      publishedAt,
      now,
      now,
    ).run() as unknown as Promise<D1RunResult>)

    // Fetch and return the created article
    const { results } = await env.DB.prepare(
      'SELECT * FROM articles WHERE id = ?'
    ).bind(meta.last_row_id).all()

    return json({ ok: true, article: (results as unknown[])[0] }, 201)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return json({ ok: false, error: msg }, 400)
  }
}

async function handleAdminUpdateArticle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const idMatch = url.pathname.match(/^\/api\/admin\/articles\/(\d+)$/)
  if (!idMatch) {
    return json({ ok: false, error: 'Article ID required' }, 400)
  }

  const id = parseInt(idMatch[1], 10)

  try {
    const body: Partial<Article> = await request.json()

    // Fetch current article
    const { results: existing } = await env.DB.prepare(
      'SELECT * FROM articles WHERE id = ?'
    ).bind(id).all()

    const rows = existing as unknown as Article[]
    if (!rows || rows.length === 0) {
      return json({ ok: false, error: 'Article not found' }, 404)
    }

    const current = rows[0]

    // If changing slug, check uniqueness
    if (body.slug && body.slug !== current.slug) {
      const { results: dupes } = await env.DB.prepare(
        'SELECT 1 FROM articles WHERE slug = ? AND id != ?'
      ).bind(body.slug, id).all()
      if (dupes && (dupes as unknown[]).length > 0) {
        return json({ ok: false, error: 'Slug already exists' }, 409)
      }
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
    let publishedAt = current.published_at

    // Auto-set published_at when transitioning to published
    if (body.status === 'published' && !publishedAt) {
      publishedAt = now
    }

    await env.DB.prepare(`
      UPDATE articles SET
        slug = ?, title = ?, excerpt = ?, body = ?, category = ?,
        image_url = ?, author_id = ?, read_time_minutes = ?,
        sort_order = ?, is_pinned = ?,
        status = ?, published_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      body.slug ?? current.slug,
      body.title ?? current.title,
      body.excerpt ?? current.excerpt ?? null,
      body.body ?? current.body ?? null,
      body.category ?? current.category ?? null,
      body.image_url ?? current.image_url ?? null,
      body.author_id ?? current.author_id,
      body.read_time_minutes ?? current.read_time_minutes ?? 5,
      body.sort_order ?? current.sort_order ?? 0,
      body.is_pinned ?? current.is_pinned ?? 0,
      body.status ?? current.status,
      publishedAt,
      now,
      id,
    ).run()

    // Fetch and return updated article
    const { results } = await env.DB.prepare(
      'SELECT * FROM articles WHERE id = ?'
    ).bind(id).all()

    return json({ ok: true, article: (results as unknown[])[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return json({ ok: false, error: msg }, 400)
  }
}

async function handleAdminDeleteArticle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const idMatch = url.pathname.match(/^\/api\/admin\/articles\/(\d+)$/)
  if (!idMatch) {
    return json({ ok: false, error: 'Article ID required' }, 400)
  }

  const id = parseInt(idMatch[1], 10)

  type D1RunResult = { meta: { changes: number } }
  const { meta } = await (env.DB.prepare(
    'DELETE FROM articles WHERE id = ?'
  ).bind(id).run() as unknown as Promise<D1RunResult>)

  if (meta.changes === 0) {
    return json({ ok: false, error: 'Article not found' }, 404)
  }

  return json({ ok: true })
}

// ── Admin Appointment Request Handlers ────────────────────────────────────

async function handleAdminGetAppointments(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)

  // CSV export
  if (url.pathname.endsWith('/export')) {
    const { results } = await env.DB.prepare(
      `SELECT id, email, name, company, interest, source, status,
              utm_source, utm_medium, utm_campaign,
              referral_code, discount_code, page_url,
              created_at, updated_at
       FROM appointment_requests
       ORDER BY created_at DESC`
    ).all()
    const rows = results as unknown as Record<string, unknown>[]
    const header = 'id,email,name,company,interest,source,status,utm_source,utm_medium,utm_campaign,referral_code,discount_code,page_url,created_at,updated_at'
    const csv = rows.map(r =>
      [r.id, r.email, r.name, r.company, r.interest, r.source, r.status,
       r.utm_source, r.utm_medium, r.utm_campaign,
       r.referral_code, r.discount_code, r.page_url,
       r.created_at, r.updated_at].map(v => v ?? '').join(',')
    ).join('\n')
    return new Response(`${header}\n${csv}`, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=appointments.csv' },
    })
  }

  // List all
  const statusFilter = url.searchParams.get('status') ?? ''
  let rows: unknown[]
  if (statusFilter) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM appointment_requests WHERE status = ? ORDER BY created_at DESC'
    ).bind(statusFilter).all()
    rows = results
  } else {
    const { results } = await env.DB.prepare(
      'SELECT * FROM appointment_requests ORDER BY created_at DESC'
    ).all()
    rows = results
  }
  return json({ ok: true, appointments: rows as unknown[] })
}

async function handleAdminUpdateAppointment(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const idMatch = url.pathname.match(/^\/api\/admin\/appointment-requests\/(\d+)$/)
  if (!idMatch) return json({ ok: false, error: 'Appointment ID required' }, 400)

  const id = parseInt(idMatch[1], 10)
  try {
    const body = await request.json() as { status?: string }
    if (body.status && !['pending', 'verified', 'completed', 'cancelled'].includes(body.status)) {
      return json({ ok: false, error: 'Invalid status' }, 400)
    }
    await env.DB.prepare(`
      UPDATE appointment_requests SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(body.status ?? 'completed', id).run()
    return json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return json({ ok: false, error: msg }, 400)
  }
}

// ── Admin Subscriber Handlers ─────────────────────────────────────────────

async function handleAdminGetSubscribers(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)

  // CSV export
  if (url.pathname.endsWith('/export')) {
    const { results } = await env.DB.prepare(
      `SELECT id, email, name, source, status,
              utm_source, utm_medium, utm_campaign,
              created_at, updated_at
       FROM subscribers
       ORDER BY created_at DESC`
    ).all()
    const rows = results as unknown as Record<string, unknown>[]
    const header = 'id,email,name,source,status,utm_source,utm_medium,utm_campaign,created_at,updated_at'
    const csv = rows.map(r =>
      [r.id, r.email, r.name, r.source, r.status,
       r.utm_source, r.utm_medium, r.utm_campaign,
       r.created_at, r.updated_at].map(v => v ?? '').join(',')
    ).join('\n')
    return new Response(`${header}\n${csv}`, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=subscribers.csv' },
    })
  }

  // List all
  const statusFilter = url.searchParams.get('status') ?? ''
  let rows: unknown[]
  if (statusFilter) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM subscribers WHERE status = ? ORDER BY created_at DESC'
    ).bind(statusFilter).all()
    rows = results
  } else {
    const { results } = await env.DB.prepare(
      'SELECT * FROM subscribers ORDER BY created_at DESC'
    ).all()
    rows = results
  }
  return json({ ok: true, subscribers: rows as unknown[] })
}

// ── Admin Upload Handlers ─────────────────────────────────────────────────

async function handleAdminUpload(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const slug = formData.get('slug') as string | null

    if (!file) return json({ ok: false, error: 'No file provided' }, 400)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return json({ ok: false, error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}` }, 400)
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return json({ ok: false, error: 'File too large. Max 10MB' }, 400)
    }

    // Generate path: /articles/{slug or uuid}/{filename}
    const assetSlug = slug || crypto.randomUUID()
    const ext = file.name.split('.').pop() || 'png'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const key = `articles/${assetSlug}/${filename}`

    const buffer = await file.arrayBuffer()
    await env.CMS_ASSETS.put(key, buffer, {
      httpMetadata: { contentType: file.type },
    })

    const publicUrl = `/cms-assets/${key}`

    return json({ ok: true, url: publicUrl, key })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return json({ ok: false, error: msg }, 500)
  }
}

// ── OAuth Handlers ────────────────────────────────────────────────────────

function generateState(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function handleOAuthGoogle(request: Request, env: Env): Promise<Response> {
  const clientId = env.GOOGLE_CLIENT_ID
  if (!clientId) return json({ ok: false, error: 'Google OAuth not configured' }, 501)

  const state = generateState()
  const baseUrl = env.OAUTH_BASE_URL || `https://${new URL(request.url).hostname}`
  const redirectUri = `${baseUrl}/api/admin/auth/google/callback`

  // Store state in D1 with 10min expiry
  await env.DB.prepare(
    "INSERT INTO admin_oauth_state (state, provider, expires_at) VALUES (?, 'google', datetime('now', '+10 minutes'))"
  ).bind(state).run()

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&state=${state}`
  return Response.redirect(url, 302)
}

async function handleOAuthGoogleCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) return json({ ok: false, error: 'Missing code or state' }, 400)

  // Verify state
  const { results } = await env.DB.prepare(
    "SELECT 1 FROM admin_oauth_state WHERE state = ? AND provider = 'google' AND expires_at > datetime('now')"
  ).bind(state).all()
  if (!results || (results as unknown[]).length === 0) {
    return json({ ok: false, error: 'Invalid or expired state' }, 400)
  }
  await env.DB.prepare('DELETE FROM admin_oauth_state WHERE state = ?').bind(state).run()

  const clientId = env.GOOGLE_CLIENT_ID!
  const clientSecret = env.GOOGLE_CLIENT_SECRET!
  const baseUrl = env.OAUTH_BASE_URL || `https://${url.hostname}`
  const redirectUri = `${baseUrl}/api/admin/auth/google/callback`

  // Exchange code for token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: redirectUri, grant_type: 'authorization_code',
    }),
  })
  const tokenData = await tokenRes.json() as { access_token?: string; error?: string }
  if (!tokenData.access_token) {
    return json({ ok: false, error: tokenData.error || 'Token exchange failed' }, 400)
  }

  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const userData = await userRes.json() as { email?: string; name?: string; id?: string }
  if (!userData.email) {
    return json({ ok: false, error: 'Failed to get user info' }, 400)
  }

  return handleOAuthUserLogin(request, env, userData.email, userData.name || userData.email, 'google')
}

async function handleOAuthGitHub(request: Request, env: Env): Promise<Response> {
  const clientId = env.GITHUB_CLIENT_ID
  if (!clientId) return json({ ok: false, error: 'GitHub OAuth not configured' }, 501)

  const state = generateState()
  const baseUrl = env.OAUTH_BASE_URL || `https://${new URL(request.url).hostname}`
  const redirectUri = `${baseUrl}/api/admin/auth/github/callback`

  await env.DB.prepare(
    "INSERT INTO admin_oauth_state (state, provider, expires_at) VALUES (?, 'github', datetime('now', '+10 minutes'))"
  ).bind(state).run()

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`
  return Response.redirect(url, 302)
}

async function handleOAuthGitHubCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) return json({ ok: false, error: 'Missing code or state' }, 400)

  // Verify state
  const { results } = await env.DB.prepare(
    "SELECT 1 FROM admin_oauth_state WHERE state = ? AND provider = 'github' AND expires_at > datetime('now')"
  ).bind(state).all()
  if (!results || (results as unknown[]).length === 0) {
    return json({ ok: false, error: 'Invalid or expired state' }, 400)
  }
  await env.DB.prepare('DELETE FROM admin_oauth_state WHERE state = ?').bind(state).run()

  const clientId = env.GITHUB_CLIENT_ID!
  const clientSecret = env.GITHUB_CLIENT_SECRET!

  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
    }),
  })
  const tokenData = await tokenRes.json() as { access_token?: string; error?: string }
  if (!tokenData.access_token) {
    return json({ ok: false, error: tokenData.error || 'Token exchange failed' }, 400)
  }

  // Get user info
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const userData = await userRes.json() as { email?: string; login?: string; id?: number }
  let email = userData.email

  // If public email is empty, try the emails API
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const emails = await emailsRes.json() as Array<{ email: string; primary: boolean }>
    const primary = emails.find(e => e.primary)
    email = primary?.email || emails[0]?.email
  }

  if (!email) return json({ ok: false, error: 'Failed to get email' }, 400)

  return handleOAuthUserLogin(request, env, email, userData.login || email, 'github')
}

async function handleOAuthUserLogin(
  request: Request, env: Env, email: string, name: string, provider: string
): Promise<Response> {
  // Check if user exists in admin_users
  const { results } = await env.DB.prepare(
    'SELECT id, status FROM admin_users WHERE email = ?'
  ).bind(email).all()
  const rows = results as unknown as Array<{ id: number; status: string }>

  if (!rows || rows.length === 0) {
    // Auto-register as pending
    await env.DB.prepare(
      "INSERT INTO admin_users (email, name, provider, status) VALUES (?, ?, ?, 'pending')"
    ).bind(email, name, provider).run()
    // Redirect to pending approval page
    return Response.redirect(new URL('/internala/pending', request.url).toString(), 302)
  }

  const user = rows[0]
  if (user.status !== 'approved') {
    return Response.redirect(new URL('/internala/pending', request.url).toString(), 302)
  }

  // Create session
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000).toISOString()
  await env.DB.prepare(
    'INSERT INTO admin_sessions (session_id, created_at, expires_at) VALUES (?, datetime(\'now\'), ?)'
  ).bind(sessionId, expiresAt).run()

  const response = new Response(null, { status: 302 })
  response.headers.set('Location', '/internala')
  response.headers.set('Set-Cookie', setSessionCookie(sessionId))
  return response
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
      case '/api/appointment-requests': return handleAppointmentRequest(request, env)
      case '/api/admin/login': return handleAdminLogin(request, env)
      case '/api/admin/logout': return handleAdminLogout(request, env)
      case '/api/admin/upload': return handleAdminUpload(request, env)
    }
  }

  if (request.method === 'GET') {
    // Public articles
    if (path.startsWith('/api/articles')) {
      return handleGetArticles(request, env)
    }

    // Admin articles
    if (path.startsWith('/api/admin/articles')) {
      return handleAdminGetArticles(request, env)
    }

    // Admin appointment requests
    if (path.startsWith('/api/admin/appointment-requests')) {
      return handleAdminGetAppointments(request, env)
    }

    // Admin subscribers
    if (path.startsWith('/api/admin/subscribers')) {
      return handleAdminGetSubscribers(request, env)
    }

    // OAuth endpoints
    switch (path) {
      case '/api/admin/auth/google':
        return handleOAuthGoogle(request, env)
      case '/api/admin/auth/google/callback':
        return handleOAuthGoogleCallback(request, env)
      case '/api/admin/auth/github':
        return handleOAuthGitHub(request, env)
      case '/api/admin/auth/github/callback':
        return handleOAuthGitHubCallback(request, env)
    }

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

  // Admin article mutations (POST/PUT/DELETE)
  if (path.startsWith('/api/admin/articles')) {
    if (request.method === 'POST') return handleAdminCreateArticle(request, env)
    if (request.method === 'PUT') return handleAdminUpdateArticle(request, env)
    if (request.method === 'DELETE') return handleAdminDeleteArticle(request, env)
  }

  // Admin appointment request mutation (PUT to update status)
  if (path.startsWith('/api/admin/appointment-requests')) {
    if (request.method === 'PUT') return handleAdminUpdateAppointment(request, env)
  }

  return null
}

// ── Main entry ───────────────────────────────────────────────────────────

export interface Env {
  /** Static assets binding from Astro build */
  ASSETS: Fetcher
  /** D1 database for transaction log + business data */
  DB: D1Database
  /** R2 bucket for CMS asset uploads */
  CMS_ASSETS: R2Bucket
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
  /** Google OAuth client ID */
  GOOGLE_CLIENT_ID?: string
  /** Google OAuth client secret */
  GOOGLE_CLIENT_SECRET?: string
  /** GitHub OAuth client ID */
  GITHUB_CLIENT_ID?: string
  /** GitHub OAuth client secret */
  GITHUB_CLIENT_SECRET?: string
  /** Base URL for OAuth redirects */
  OAUTH_BASE_URL?: string
}

// ── Main entry ───────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url)

      // Route `/insights/:slug/` → `/insights/article/` for dynamic article detail
      const insightsMatch = url.pathname.match(/^\/insights\/([^/]+)\/$/)
      if (insightsMatch && insightsMatch[1] !== 'article') {
        // Rewrite to the static article page — Vue component reads slug from URL
        url.pathname = '/insights/article/'
        return env.ASSETS.fetch(new Request(url.toString(), request))
      }

      // Serve uploaded CMS assets from R2
      const assetsMatch = url.pathname.match(/^\/cms-assets\/(.+)$/)
      if (assetsMatch) {
        const key = assetsMatch[1]
        const object = await env.CMS_ASSETS.get(key)
        if (!object) {
          return json({ ok: false, error: 'Asset not found' }, 404)
        }
        const headers = new Headers()
        headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream')
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')
        return new Response(object.body, { headers })
      }

      // Protect internal routes (redirect to login if no session)
      const protectResponse = await protectInternalRoute(request, env)
      if (protectResponse) return protectResponse

      // Handle API routes
      const apiResponse = await handleApi(request, env)
      if (apiResponse) return apiResponse

      // Serve static assets (default — Astro build output)
      const response = await env.ASSETS.fetch(request)
      if (response.status === 404) {
        const notFoundUrl = new URL('/404.html', request.url)
        const notFound = await env.ASSETS.fetch(new Request(notFoundUrl, request))
        return new Response(await notFound.text(), {
          status: 404,
          headers: { 'content-type': 'text/html' },
        })
      }
      return response
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return json({ error: 'Internal error', detail: msg }, 500)
    }
  },
}
