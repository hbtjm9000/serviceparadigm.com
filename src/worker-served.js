// src/worker.ts
async function logBegin(db, tx) {
  const { meta } = await db.prepare(`
    INSERT INTO transaction_log
      (request_id, endpoint, method, request_body, request_headers,
       cf_country, cf_ip, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `).bind(
    tx.requestId,
    tx.endpoint,
    tx.method,
    JSON.stringify(tx.body || {}),
    JSON.stringify(tx.headers || {}),
    tx.cfCountry || null,
    tx.cfIp || null
  ).run();
  return meta.last_row_id;
}
async function logSuccess(db, logId, responseBody) {
  await db.prepare(`
    UPDATE transaction_log
    SET status = 'success', response_body = ?, completed_at = datetime('now')
    WHERE id = ?
  `).bind(JSON.stringify(responseBody), logId).run();
}
async function logFailed(db, logId, error) {
  await db.prepare(`
    UPDATE transaction_log
    SET status = 'failed', error = ?, completed_at = datetime('now')
    WHERE id = ?
  `).bind(error, logId).run();
}
function requestId() {
  return crypto.randomUUID();
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
function isFeatureEnabled(env, flag) {
  switch (flag) {
    case "order-form-enabled":
      return env.FEATURE_ORDER_ENABLED === "true";
    default:
      return true;
  }
}
var AUTH_COOKIE = "pit_admin_session";
var SESSION_DURATION = 4 * 60 * 60;
function generateSessionId() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function setSessionCookie(sessionId) {
  const expires = new Date(Date.now() + SESSION_DURATION * 1e3).toUTCString();
  return `${AUTH_COOKIE}=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expires}`;
}
function clearSessionCookie() {
  return `${AUTH_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
function parseCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.substring(0, eq).trim() === name) {
      return part.substring(eq + 1).trim();
    }
  }
  return null;
}
async function handleAuthCheck(request, env) {
  const cookie = parseCookie(request, AUTH_COOKIE);
  if (!cookie) return json({ authenticated: false }, 401);
  const { results } = await env.DB.prepare(
    "SELECT 1 FROM admin_sessions WHERE session_id = ? AND expires_at > datetime('now')"
  ).bind(cookie).all();
  return results && results.length > 0 ? json({ authenticated: true }) : json({ authenticated: false }, 401);
}
async function handleAdminLogin(request, env) {
  try {
    const body = await request.json();
    const validPassword = env.ADMIN_PASSWORD && body.password === env.ADMIN_PASSWORD;
    const validPin = env.ADMIN_PIN && body.pin === env.ADMIN_PIN;
    if (!validPassword || !validPin) {
      return json({ ok: false, error: "Invalid credentials" }, 401);
    }
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION * 1e3).toISOString();
    await env.DB.prepare(
      "INSERT INTO admin_sessions (session_id, created_at, expires_at) VALUES (?, datetime('now'), ?)"
    ).bind(sessionId, expiresAt).run();
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setSessionCookie(sessionId)
      }
    });
  } catch (err) {
    return json({ ok: false, error: "Invalid request" }, 400);
  }
}
async function handleAdminLogout(request, env) {
  const cookie = parseCookie(request, AUTH_COOKIE);
  if (cookie) {
    await env.DB.prepare("DELETE FROM admin_sessions WHERE session_id = ?").bind(cookie).run();
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Set-Cookie": clearSessionCookie(), "Content-Type": "application/json" }
  });
}
async function protectInternalRoute(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/internala/")) return null;
  if (url.pathname === "/internala/login" || url.pathname.startsWith("/internala/login")) return null;
  const cookie = parseCookie(request, AUTH_COOKIE);
  if (!cookie) {
    return Response.redirect(new URL("/internala/login", request.url).toString(), 302);
  }
  const { results } = await env.DB.prepare(
    "SELECT 1 FROM admin_sessions WHERE session_id = ? AND expires_at > datetime('now')"
  ).bind(cookie).all();
  if (!results || results.length === 0) {
    return Response.redirect(new URL("/internala/login", request.url).toString(), 302);
  }
  return null;
}
async function handleContact(request, env) {
  const cf = request.cf;
  const tx = {
    requestId: requestId(),
    endpoint: "/api/contact",
    method: request.method,
    body: await request.clone().json(),
    headers: Object.fromEntries(request.headers),
    cfCountry: cf?.country,
    cfIp: cf?.asOrganization
  };
  let logId = 0;
  try {
    logId = await logBegin(env.DB, tx);
    if (env.RESEND_API_KEY && env.CONTACT_EMAIL_TO) {
      const body = tx.body;
      const emailBody = `
        Name: ${body.name ?? ""}
        Email: ${body.email ?? ""}
        Company: ${body.company ?? ""}
        Service: ${body.service ?? ""}
        Message: ${body.message ?? ""}
        ---
        Request ID: ${tx.requestId}
      `;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "contact@serviceparadigm.com",
          to: env.CONTACT_EMAIL_TO,
          subject: `New Contact: ${body.name ?? "Unknown"}`,
          text: emailBody
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Email send failed: ${res.status} ${errText}`);
      }
    }
    const response = { ok: true, request_id: tx.requestId };
    await logSuccess(env.DB, logId, response);
    return json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (logId > 0) await logFailed(env.DB, logId, msg);
    return json({ ok: false, error: msg }, 500);
  }
}
async function handleNewsletter(request, env) {
  const cf = request.cf;
  const tx = {
    requestId: requestId(),
    endpoint: "/api/newsletter",
    method: request.method,
    body: await request.clone().json(),
    headers: Object.fromEntries(request.headers),
    cfCountry: cf?.country,
    cfIp: cf?.asOrganization
  };
  let logId = 0;
  try {
    logId = await logBegin(env.DB, tx);
    const { email } = tx.body;
    if (!email || !email.includes("@")) {
      throw new Error("Valid email required");
    }
    await env.DB.prepare(`
      INSERT INTO subscribers (email, source, status)
      VALUES (?, 'newsletter', 'active')
      ON CONFLICT(email) DO UPDATE SET
        status = 'active',
        updated_at = datetime('now')
    `).bind(email).run();
    const response = { ok: true, request_id: tx.requestId };
    await logSuccess(env.DB, logId, response);
    return json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (logId > 0) await logFailed(env.DB, logId, msg);
    return json({ ok: false, error: msg }, 400);
  }
}
async function handleOrder(request, env) {
  if (!isFeatureEnabled(env, "order-form-enabled")) {
    return json({ ok: false, error: "Order form is disabled" }, 403);
  }
  const cf = request.cf;
  const tx = {
    requestId: requestId(),
    endpoint: "/api/order",
    method: request.method,
    body: await request.clone().json(),
    headers: Object.fromEntries(request.headers),
    cfCountry: cf?.country,
    cfIp: cf?.asOrganization
  };
  let logId = 0;
  try {
    logId = await logBegin(env.DB, tx);
    const body = tx.body;
    if (!body.customer?.name || !body.customer?.email) {
      throw new Error("Customer name and email required");
    }
    if (!body.items || body.items.length === 0) {
      throw new Error("Cart is empty");
    }
    const orderRef = "ORD-" + Date.now().toString(36).toUpperCase();
    const totalCents = Math.round((body.total ?? 0) * 100);
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
      body.customer.notes ?? null
    ).run();
    const response = {
      ok: true,
      request_id: tx.requestId,
      order_ref: orderRef,
      total: body.total
    };
    await logSuccess(env.DB, logId, response);
    return json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (logId > 0) await logFailed(env.DB, logId, msg);
    return json({ ok: false, error: msg }, 400);
  }
}
async function handleTransactionList(request, env) {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") ?? "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200);
  let rows;
  if (statusFilter) {
    const { results } = await env.DB.prepare(`
      SELECT id, request_id, endpoint, method, status, error,
             substr(request_body, 1, 200) as request_preview,
             created_at, completed_at
      FROM transaction_log
      WHERE status = ?
      ORDER BY id DESC
      LIMIT ?
    `).bind(statusFilter, limit).all();
    rows = results;
  } else {
    const { results } = await env.DB.prepare(`
      SELECT id, request_id, endpoint, method, status, error,
             substr(request_body, 1, 200) as request_preview,
             created_at, completed_at
      FROM transaction_log
      ORDER BY id DESC
      LIMIT ?
    `).bind(limit).all();
    rows = results;
  }
  return json({ transactions: rows });
}
async function handleReplay(request, env) {
  const url = new URL(request.url);
  const logId = parseInt(url.searchParams.get("id") ?? "0", 10);
  if (!logId) return json({ error: "Missing ?id=" }, 400);
  const { results } = await env.DB.prepare(`
    SELECT id, request_body, endpoint, method, request_headers
    FROM transaction_log WHERE id = ?
  `).bind(logId).all();
  if (!results || results.length === 0) {
    return json({ error: "Transaction not found" }, 404);
  }
  const tx = results[0];
  return json({
    id: tx.id,
    endpoint: tx.endpoint,
    method: tx.method,
    body: JSON.parse(tx.request_body ?? "{}"),
    headers: JSON.parse(tx.request_headers ?? "{}")
  });
}
async function handleGetArticles(request, env) {
  const url = new URL(request.url);
  const slugMatch = url.pathname.match(/^\/api\/articles\/([^/]+)$/);
  if (slugMatch) {
    const slug = slugMatch[1];
    const { results: results2 } = await env.DB.prepare(`
      SELECT * FROM articles
      WHERE slug = ? AND status = 'published'
      LIMIT 1
    `).bind(slug).all();
    const rows = results2;
    if (!rows || rows.length === 0) {
      return json({ ok: false, error: "Article not found" }, 404);
    }
    return json({ ok: true, article: rows[0] });
  }
  const { results } = await env.DB.prepare(`
    SELECT id, slug, title, excerpt, category, image_url, author_id,
           read_time_minutes, published_at
    FROM articles
    WHERE status = 'published'
    ORDER BY published_at DESC
  `).all();
  return json({ ok: true, articles: results });
}
async function handleAdminGetArticles(request, env) {
  const url = new URL(request.url);
  const idMatch = url.pathname.match(/^\/api\/admin\/articles\/(\d+)$/);
  if (idMatch) {
    const id = parseInt(idMatch[1], 10);
    const { results } = await env.DB.prepare(
      "SELECT * FROM articles WHERE id = ?"
    ).bind(id).all();
    const rows2 = results;
    if (!rows2 || rows2.length === 0) {
      return json({ ok: false, error: "Article not found" }, 404);
    }
    return json({ ok: true, article: rows2[0] });
  }
  const statusFilter = url.searchParams.get("status") ?? "";
  let rows;
  if (statusFilter) {
    const { results } = await env.DB.prepare(`
      SELECT * FROM articles WHERE status = ? ORDER BY updated_at DESC
    `).bind(statusFilter).all();
    rows = results;
  } else {
    const { results } = await env.DB.prepare(`
      SELECT * FROM articles ORDER BY updated_at DESC
    `).all();
    rows = results;
  }
  return json({ ok: true, articles: rows });
}
async function handleAdminCreateArticle(request, env) {
  try {
    const body = await request.json();
    if (!body.slug || !body.title) {
      return json({ ok: false, error: "slug and title are required" }, 400);
    }
    const { results: existing } = await env.DB.prepare(
      "SELECT 1 FROM articles WHERE slug = ?"
    ).bind(body.slug).all();
    if (existing && existing.length > 0) {
      return json({ ok: false, error: "Slug already exists" }, 409);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    const publishedAt = body.status === "published" ? now : null;
    const { meta } = await env.DB.prepare(`
      INSERT INTO articles (slug, title, excerpt, body, category, image_url,
                            author_id, read_time_minutes, status, published_at,
                            created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.slug,
      body.title,
      body.excerpt ?? null,
      body.body ?? null,
      body.category ?? null,
      body.image_url ?? null,
      body.author_id ?? "hal",
      body.read_time_minutes ?? 5,
      body.status ?? "draft",
      publishedAt,
      now,
      now
    ).run();
    const { results } = await env.DB.prepare(
      "SELECT * FROM articles WHERE id = ?"
    ).bind(meta.last_row_id).all();
    return json({ ok: true, article: results[0] }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: msg }, 400);
  }
}
async function handleAdminUpdateArticle(request, env) {
  const url = new URL(request.url);
  const idMatch = url.pathname.match(/^\/api\/admin\/articles\/(\d+)$/);
  if (!idMatch) {
    return json({ ok: false, error: "Article ID required" }, 400);
  }
  const id = parseInt(idMatch[1], 10);
  try {
    const body = await request.json();
    const { results: existing } = await env.DB.prepare(
      "SELECT * FROM articles WHERE id = ?"
    ).bind(id).all();
    const rows = existing;
    if (!rows || rows.length === 0) {
      return json({ ok: false, error: "Article not found" }, 404);
    }
    const current = rows[0];
    if (body.slug && body.slug !== current.slug) {
      const { results: dupes } = await env.DB.prepare(
        "SELECT 1 FROM articles WHERE slug = ? AND id != ?"
      ).bind(body.slug, id).all();
      if (dupes && dupes.length > 0) {
        return json({ ok: false, error: "Slug already exists" }, 409);
      }
    }
    const now = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    let publishedAt = current.published_at;
    if (body.status === "published" && !publishedAt) {
      publishedAt = now;
    }
    await env.DB.prepare(`
      UPDATE articles SET
        slug = ?, title = ?, excerpt = ?, body = ?, category = ?,
        image_url = ?, author_id = ?, read_time_minutes = ?,
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
      body.status ?? current.status,
      publishedAt,
      now,
      id
    ).run();
    const { results } = await env.DB.prepare(
      "SELECT * FROM articles WHERE id = ?"
    ).bind(id).all();
    return json({ ok: true, article: results[0] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: msg }, 400);
  }
}
async function handleAdminDeleteArticle(request, env) {
  const url = new URL(request.url);
  const idMatch = url.pathname.match(/^\/api\/admin\/articles\/(\d+)$/);
  if (!idMatch) {
    return json({ ok: false, error: "Article ID required" }, 400);
  }
  const id = parseInt(idMatch[1], 10);
  const { meta } = await env.DB.prepare(
    "DELETE FROM articles WHERE id = ?"
  ).bind(id).run();
  if (meta.changes === 0) {
    return json({ ok: false, error: "Article not found" }, 404);
  }
  return json({ ok: true });
}
async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === "POST") {
    switch (path) {
      case "/api/contact":
        return handleContact(request, env);
      case "/api/newsletter":
        return handleNewsletter(request, env);
      case "/api/order":
        return handleOrder(request, env);
      case "/api/admin/login":
        return handleAdminLogin(request, env);
      case "/api/admin/logout":
        return handleAdminLogout(request, env);
    }
  }
  if (request.method === "GET") {
    if (path.startsWith("/api/articles")) {
      return handleGetArticles(request, env);
    }
    if (path.startsWith("/api/admin/articles")) {
      return handleAdminGetArticles(request, env);
    }
    switch (path) {
      case "/api/health":
        return json({ ok: true, env: "production", ts: (/* @__PURE__ */ new Date()).toISOString() });
      case "/api/admin/transactions":
        return handleTransactionList(request, env);
      case "/api/admin/replay":
        return handleReplay(request, env);
      case "/api/admin/check":
        return handleAuthCheck(request, env);
    }
  }
  if (path.startsWith("/api/admin/articles")) {
    if (request.method === "POST") return handleAdminCreateArticle(request, env);
    if (request.method === "PUT") return handleAdminUpdateArticle(request, env);
    if (request.method === "DELETE") return handleAdminDeleteArticle(request, env);
  }
  return null;
}
var worker_default = {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const insightsMatch = url.pathname.match(/^\/insights\/([^/]+)\/$/);
      if (insightsMatch && insightsMatch[1] !== "article") {
        url.pathname = "/insights/article/";
        return env.ASSETS.fetch(new Request(url.toString(), request));
      }
      const protectResponse = await protectInternalRoute(request, env);
      if (protectResponse) return protectResponse;
      const apiResponse = await handleApi(request, env);
      if (apiResponse) return apiResponse;
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        const notFoundUrl = new URL("/404.html", request.url);
        const notFound = await env.ASSETS.fetch(new Request(notFoundUrl, request));
        return new Response(await notFound.text(), {
          status: 404,
          headers: { "content-type": "text/html" }
        });
      }
      return response;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return json({ error: "Internal error", detail: msg }, 500);
    }
  }
};
export {
  worker_default as default
};
import { worker_default } from './worker-bundle.js';

addEventListener('fetch', (event) => {
  const env = {
    DB: event.DB,
    ASSETS: event.ASSETS,
    RESEND_API_KEY: event.RESEND_API_KEY,
    CONTACT_EMAIL_TO: event.CONTACT_EMAIL_TO,
    GROWTHBOOK_CLIENT_KEY: event.GROWTHBOOK_CLIENT_KEY,
    ADMIN_PASSWORD: event.ADMIN_PASSWORD,
    ADMIN_PIN: event.ADMIN_PIN,
    FEATURE_ORDER_ENABLED: event.FEATURE_ORDER_ENABLED,
  };
  event.respondWith(worker_default.fetch(event.request, env));
});
