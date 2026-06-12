# serviceparadigm.com — Full Site Analysis

**Generated:** 2026-06-11
**Stack:** Astro 6 + Vue 3 + Tailwind v4 + Bun + Cloudflare Pages
**Repo:** `~/lab/serviceparadigm.com/`

---

## Architecture Overview

```mermaid
graph TB
    subgraph "Build Time"
        ASTRO["Astro 6 CLI<br/>bun run build"]
        TAILWIND["Tailwind v4<br/>CSS @theme config"]
        VUE["Vue 3 SFC<br/>client:load / client:visible"]
        CONTENT["Content Collections<br/>src/content/hero/*"]
        SITEMAP["@astrojs/sitemap"]
        SHARP["Sharp<br/>Image Optimization"]
    end

    subgraph "Runtime — Cloudflare Pages"
        CF["Cloudflare Pages<br/>Global Edge Network"]
        STATIC["Static HTML/CSS/JS<br/>dist/ directory"]
        API["API Endpoints<br/>src/pages/api/*"]
        ADMIN["Admin SPA<br/>Static + JS"]
    end

    subgraph "External Services"
        GB["GrowthBook<br/>Feature Flags / A/B"]
        GA4["Google Analytics 4<br/>serviceparadigm.com"]
        CONTACT["Contact Form<br/>Form Processing"]
    end

    subgraph "Local Dev Tooling"
        DEV_SERVER["Astro Dev Server<br/>localhost:4321"]
        API_SERVER["CMS API Server<br/>localhost:4322"]
        SQLITE["variants.db<br/>Bun:SQLite"]
        VITE["Vite ^7<br/>(pinned override)"]
    end

    ASTRO --> STATIC
    VUE --> ASTRO
    TAILWIND --> ASTRO
    CONTENT --> ASTRO
    SHARP --> ASTRO
    SITEMAP --> ASTRO
    STATIC --> CF
    API --> CF
    ADMIN --> CF
    DEV_SERVER --> API_SERVER
    API_SERVER --> SQLITE
    CF --> GB
    CF --> GA4
    CF --> CONTACT
    GB --> VUE
    GA4 --> VUE
```

---

## Public Site Features (Pages)

```mermaid
graph LR
    HOME["/ — Homepage<br/>Hero + Mission +<br/>Services + Elements<br/>+ Insights + Newsletter"]
    SERVICES["/services — Services<br/>AI Strategy, Solutions<br/>Architecture, Cybersecurity"]
    ELEMENTS["/elements — Elements<br/>Email, Zero Trust, Digital<br/>Presence, BC, Cloud, HA"]
    INSIGHTS["/insights — Blog /<br/>Content Marketing"]
    ABOUT["/about — About /<br/>Founder, Values<br/>Two-Tier Service"]
    CONTACT["/contact — Contact<br/>Form + Info"]
    LANDINGS["/landings/*<br/>packaged-ai, element<br/>(Sales Landing Pages)"]
    LEGAL["/privacy, /terms<br/>/accessibility"]

    HOME --> SERVICES
    HOME --> ELEMENTS
    HOME --> INSIGHTS
    HOME --> ABOUT
    HOME --> CONTACT
    SERVICES --> CONTACT
    ELEMENTS --> CONTACT
    LANDINGS --> CONTACT
```

**Page Inventory:**

| Page | Route | Type | Interactive Elements |
|------|-------|------|-------------------|
| Home | `/` | Astro + Vue SFC | Hero (Vue), Newsletter (Vue) |
| Services | `/services` | Astro static | None |
| Elements | `/elements` | Astro static | Newsletter (Vue) |
| Insights | `/insights` | Astro static | Newsletter (Vue) |
| About | `/about` | Astro static | Newsletter (Vue) |
| Contact | `/contact` | Astro + Vue SFC | ContactForm (Vue) |
| Packaged AI | `/landings/packaged-ai` | Astro + Vue SFC | ContactForm (Vue) |
| Element DP | `/landings/element` | Astro + Vue SFC | ContactForm (Vue) |
| Privacy | `/privacy` | Astro | None |
| Terms | `/terms` | Astro | None |
| Accessibility | `/accessibility` | Astro | None |

---

## Design System

```mermaid
graph TB
    subgraph "Design Tokens (globals.css)"
        FONTS["Fonts<br/>- Switzer (body)<br/>- Instrument Serif (headline)<br/>- Space Grotesk (label)"]
        COLORS["Colors<br/>- Primary: #a33900<br/>- Secondary: #006a68<br/>- Surface hierarchy"]
        SPACING["Spacing / Radius<br/>- No rounded corners<br/>- Background shifts<br/>  instead of borders"]
    end

    subgraph "Component Layer"
        CSS_LAYER["@layer components<br/>- .btn-primary<br/>- .btn-secondary<br/>- .input-underline"]
    end

    subgraph "Styling Rules"
        RULE1["font-headline / font-body / font-label<br/>NEVER font-sans/font-serif"]
        RULE2["Section separation via<br/>bg-surface → bg-surface-container<br/>background shifts"]
        RULE3["No borders between sections<br/>Ghost borders at 15% opacity<br/>if unavoidable"]
    end

    FONTS --> CSS_LAYER
    COLORS --> CSS_LAYER
    SPACING --> CSS_LAYER
    CSS_LAYER --> RULE1
    CSS_LAYER --> RULE2
    CSS_LAYER --> RULE3
```

---

## APIs

### 1. CMS API Server (`scripts/api-server.ts` — port 4322)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/variants?experiment=hero` | GET | Fetch experiment variants from SQLite |
| `/variants` | POST | Save/update variants (upsert) |
| `/variants/:key` | DELETE | Delete a variant |
| `/results?experiment=hero&days=30` | GET | Fetch experiment exposure/conversion results |
| `/results` | POST | Record exposures and/or conversions |
| `/analysis?experiment=hero&days=30` | GET | Full statistical analysis with winner detection |
| `/promote` | POST | Promote a winning variant to default |

**Statistical methods:** Wilson score interval, two-proportion z-test, p-value calculation, winner detection at p<0.05 significance.

### 2. Astro API Endpoint (`src/pages/api/cms/save-variants.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cms/save-variants` | POST | Save variants to SQLite + sync to JSON |
| `/api/cms/save-variants?experiment=hero` | GET | Fetch variants from SQLite |

### 3. GA4 Analytics API (`src/cms/lib/ga4-api.ts`)

| Function | Description |
|----------|-------------|
| `fetchConversions()` | Pull conversion events from GA4 via Google Analytics Data API |
| `fetchExposures()` | Pull exposure/impression data from GA4 |
| `syncGA4Data()` | Sync GA4 data with experiment_results table |

**Auth:** Google service account (`secrets/ga4-credentials.json`)

### 4. Content API (`src/cms/lib/content-api.ts`)

| Function | Description |
|----------|-------------|
| `getVariants()` | Fetch variants (dev: direct JSON fetch, prod: import fallback) |
| `saveVariants()` | POST to `/api/cms/save-variants` |
| `createVariant()` | Create + save new variant |
| `updateVariant()` | Partial update existing variant |
| `deleteVariant()` | Remove variant |

### 5. GrowthBook Feature Flag API (`src/lib/features.ts`)

| Function | Description |
|----------|-------------|
| `getStringValue()` | Read string flag (OpenFeature-compatible) |
| `getBooleanValue()` | Read boolean flag |
| `getNumberValue()` | Read numeric flag |
| `getObjectValue()` | Read JSON object flag |
| `isOn()` / `isOff()` | Shorthand boolean tests |

---

## Admin Tools

```mermaid
graph TB
    subgraph "Admin Panel (/admin/*)"
        LOGIN["/admin/login<br/>Password auth<br/>localStorage token"]
        EXPERIMENTS["/admin/experiments<br/>Variant Manager<br/>CRUD + Grid"]
        EDITOR["/admin/experiments/edit?key=<br/>Inline Editor<br/>Live Preview"]
        RESULTS["/admin/experiments/results<br/>Results Dashboard<br/>Chart.js + Stats"]
    end

    subgraph "Backend Support"
        AUTH["auth.ts<br/>localStorage token<br/>check + redirect"]
        ADMIN_LAYOUT["AdminLayout.vue<br/>Vue Router SPA"]
        CMS_APP["App.vue<br/>Vue Router root"]
        ROUTER["router.ts<br/>Vue Router config"]
    end

    LOGIN --> EXPERIMENTS
    EXPERIMENTS --> EDITOR
    EXPERIMENTS --> RESULTS
    CMS_APP --> ROUTER
    ROUTER --> ADMIN_LAYOUT
```

| Tool | Location | What it does |
|------|----------|-------------|
| **Variant Manager** | `/admin/experiments` | CRUD grid for hero experiment variants. Create, edit, preview, delete variants. Calls `localhost:4322` API. |
| **Inline Editor** | `/admin/experiments/[key]` | Edit variant copy with live preview panel, character counts, save to SQLite. |
| **Results Dashboard** | `/admin/experiments/results` | Chart.js-powered dashboard: conversion rates, exposure/conversion funnel, variant comparison, statistical significance (p-values), confidence intervals, winner detection + promote button. |
| **Login** | `/admin/login` | Simple password auth via `localStorage`. Token: `paradigm2026` (hardcoded for now). |
| **CMS SPA** | `src/cms/` | Vue Router SPA with AdminLayout, routes for /experiments, /experiments/:key, /content |

---

## Dev Tools

### Quality & CI Toolchain

```mermaid
graph LR
    subgraph "Quality Gates"
        LINT["ESLint<br/>astro/vue/ts"]
        TYPE["TypeScript<br/>tsc --noEmit"]
        UNIT["Vitest<br/>Unit Tests"]
        E2E["Playwright<br/>E2E Tests"]
        VISUAL["Playwright<br/>Visual Regression"]
        A11Y["axe-core<br/>Accessibility"]
        BDD["Cucumber.js<br/>BDD Features"]
        BUNDLE["vite-bundle-visualizer<br/>Bundle Analysis"]
    end

    subgraph "Audit Tools"
        SEC["audit-security.ts<br/>npm audit + CVEs"]
        SEO["audit-seo.ts<br/>Lychee links + SEO"]
        CI["audit-ci.ts<br/>Lint + Type + Test + Build"]
    end

    subgraph "Scripts"
        DEPLOY["deploy-cf.py<br/>Cloudflare Pages REST API"]
        DB_INIT["init-db.ts<br/>SQLite schema setup"]
        MIGRATE["migrate-variants.ts<br/>JSON → SQLite"]
        SYNC["sync-variants.ts<br/>SQLite → JSON"]
        UPDATE["update-variants.ts<br/>Direct JSON write"]
        MIGRATE_RESULTS["migrate-results-schema.ts<br/>Add results tables"]
    end

    LINT --> CI
    TYPE --> CI
    UNIT --> CI
    CI --> DEPLOY
```

### Available Scripts (`package.json`)

| Category | Scripts |
|----------|---------|
| **Dev** | `bun run dev` (local :4321), `bun run preview` |
| **Build** | `bun run build` → `dist/` directory |
| **Lint** | `bun run lint`, `lint:fix` |
| **TypeCheck** | `bun run typecheck`, `typecheck:ci` |
| **Tests** | `test` (vitest), `test:e2e`, `test:a11y`, `test:visual`, `test:p0`, `test:bdd`, `test:all` |
| **Audits** | `audit:a11y`, `audit:security`, `audit:seo`, `audit:links`, `audit:bundle`, `audit:ci` |
| **CI** | `ci:full` (typecheck + lint + test:unit + build + audit:ci) |
| **CMS** | `bun run scripts/api-server.ts` (standalone CMS API on :4322) |

### Key Dependencies

| Package | Role |
|---------|------|
| `astro@^6.2.1` | Static site generator |
| `vue@^3.5.33` | Client-side interactivity |
| `tailwindcss@^4.3.0` | CSS framework |
| `@tailwindcss/postcss@^4.3.0` | PostCSS plugin for v4 |
| `@growthbook/growthbook@^1.6.5` | Feature flags / A/B testing |
| `@openfeature/web-sdk@^1.8.0` | OpenFeature standard interface |
| `googleapis@^171.4.0` | GA4 Data API client |
| `lucide-vue-next@^1.0.0` | Icon library |
| `sharp@^0.34.5` | Image optimization |
| `@fontsource/instrument-serif` | Self-hosted serif font |
| `@fontsource/space-grotesk` | Self-hosted label font |
| **Dev:** | Playwright, Vitest, ESLint, Cucumber.js, Lighthouse, axe-core, lychee |

### Deployment

```mermaid
sequenceDiagram
    participant Dev as Local Dev
    participant Git as Forgejo Repo
    participant CI as Forgejo Actions
    participant CF as Cloudflare Pages

    Dev->>Git: git push
    Git->>CI: trigger workflow
    CI->>CI: bun install
    CI->>CI: bun run typecheck:ci
    CI->>CI: bun run lint
    CI->>CI: bun run test:unit
    CI->>CI: bun run build
    CI->>CI: bun scripts/deploy-cf.py
    CI->>CF: REST API multipart upload
    CF->>CF: Deploy to production.serviceparadigm.com
    Note over CF: Custom Python deploy<br/>(NOT wrangler CLI)
```

**Deploy script:** `scripts/deploy-cf.py` — custom Python that:
1. Builds with `bun run build`
2. Generates SHA256 manifest of all files
3. POSTs multipart form data to Cloudflare Pages API
4. Handles CORS, errors, commit hash tracking

---

## Management Tools

### A/B Experiment System

```mermaid
graph TB
    subgraph "Variant Source of Truth"
        SQLITE_DB["variants.db<br/>Bun:SQLite tables<br/>- variants<br/>- experiment_results<br/>- experiment_events<br/>- audit_log"]
        JSON_FILE["src/content/hero/variants.json<br/>Astro build-time read"]
    end

    subgraph "Client-Side Experimentation"
        FEATURE["features.ts<br/>OpenFeature wrapper"]
        GB["GrowthBook SDK<br/>apiHost + clientKey"]
        COMPOSABLE["useExperiment.ts<br/>localStorage persistence<br/>variant assignment<br/>GA4 exposure logging"]
    end

    subgraph "Management"
        ADMIN_UI["Admin Panel<br/>CRUD + Results<br/>+ Winner Promotion"]
        API_SERVER["CMS API Server<br/>REST endpoints"]
        GA4_SYNC["ga4-api.ts<br/>Auto-sync from GA4"]
    end

    ADMIN_UI --> API_SERVER
    API_SERVER --> SQLITE_DB
    SQLITE_DB --> JSON_FILE
    JSON_FILE --> FEATURE
    FEATURE --> GB
    GB --> COMPOSABLE
    GA4_SYNC --> SQLITE_DB
    COMPOSABLE --> GA4
```

| Component | What it manages |
|-----------|----------------|
| **Variants** | SQLite DB + JSON file. Variant copy: label, headline, headline_highlight, cta_text, subheadline |
| **Experiments** | Currently scoped to `hero` experiment. `useExperiment.ts` handles random assignment + localStorage persistence |
| **Results** | Daily exposure/conversion aggregates + individual event log. Manual entry + GA4 sync |
| **Analysis** | Wilson score CIs, z-test p-values, winner detection at p<0.05 |
| **Promotion** | Promote winning variant to default via admin UI |
| **Audit Log** | Full history: CREATE, UPDATE, DELETE, PROMOTE actions with before/after JSON snapshots |

### GrowthBook Integration

```mermaid
graph LR
    GB_INSTANCE["Self-hosted GrowthBook<br/>MongoDB + API<br/>via Podman"]
    SDK["@growthbook/growthbook<br/>Client SDK"]
    FEATURES["features.ts<br/>OpenFeature API"]
    VUE["Vue Components<br/>HeroClient, etc."]
    GA4_TRACK["GA4 gtag<br/>experiment_viewed<br/>events"]

    GB_INSTANCE --> SDK
    SDK --> FEATURES
    FEATURES --> VUE
    VUE --> GA4_TRACK
```

**Deployment status:** Self-hosted GrowthBook instance deployed in Docker, accessible via Caddy reverse proxy. Client SDK wired in. Currently transitioning from the custom `useExperiment.ts` localStorage system to full GrowthBook feature flags.

### GA4 Analytics Sync

- **Service Account:** Google service account auth
- **Property ID:** Configurable via `GA4_PROPERTY_ID`
- **Metrics:** Exposures (page views, sessions), Conversions (form submissions, newsletter signups)
- **Sync Frequency:** Manual via CLI: `bun run src/cms/lib/ga4-api.ts --experiment=hero --days=7`
- **Diagnostics:** `ga4-diagnose.ts` tests service account access, real-time data, report data existence

---

## CMS Architecture Detail

```mermaid
graph TB
    subgraph "Data Flow"
        ADMIN_UI["Admin UI<br/>Variant CRUD"]
        API_SERVER["API Server :4322<br/>/variants, /results<br/>/analysis, /promote"]
        SQLITE["variants.db<br/>Bun:SQLite"]
        JSON_FILE["variants.json<br/>Build-time read"]
        ASTRO_BUILD["Astro Build<br/>getCollection()"]
        STATIC_SITE["Static Site"]
    end

    subgraph "DB Schema"
        V_TABLE["variants<br/>(experiment_key, variant_key,<br/>label, headline, cta, subheadline,<br/>created_at, updated_at)"]
        R_TABLE["experiment_results<br/>(experiment_key, variant_key,<br/>date, exposures, conversions)"]
        E_TABLE["experiment_events<br/>(id, experiment_key, variant_key,<br/>event_type, event_data, timestamp)"]
        A_TABLE["audit_log<br/>(id, experiment_key, action,<br/>variant_key, old_value, new_value)"]
    end

    ADMIN_UI --> API_SERVER
    API_SERVER --> SQLITE
    API_SERVER --> JSON_FILE
    SQLITE --> V_TABLE
    SQLITE --> R_TABLE
    SQLITE --> E_TABLE
    SQLITE --> A_TABLE
    JSON_FILE --> ASTRO_BUILD
    ASTRO_BUILD --> STATIC_SITE
```

---

## Deployment & Infrastructure

| Aspect | Details |
|--------|---------|
| **Hosting** | Cloudflare Pages (global edge) |
| **Domain** | `serviceparadigm.com` |
| **Deploy method** | Python REST API (`deploy-cf.py`) — multipart/form-data to Cloudflare API |
| **Account** | Cloudflare account `9d95bf7c9bdb30749459cf45cf671b7c` |
| **Project** | `serviceparadigm-com` |
| **Build output** | `dist/` directory |
| **Branch** | `production` |
| **Cache control** | `public/_headers`: fonts immutable 1yr, JS/CSS 1yr, HTML 0s |

### Local Dev Infrastructure

| Service | URL | Purpose |
|---------|-----|---------|
| Astro Dev Server | `http://localhost:4321` | Main dev server |
| CMS API Server | `http://localhost:4322` | Variant CRUD + results API |
| GrowthBook | Via Caddy reverse proxy | Feature flags & experiments |
| GA4 API | External | Analytics data pull |

---

## Security & Auth

| Layer | Mechanism | Notes |
|-------|-----------|-------|
| **Admin login** | localStorage token (`paradigm2026`) | Basic — hardcoded password. Needs proper auth. |
| **Admin auth.ts** | Password hash comparison + redirect | Simple client-side guard |
| **API auth** | None on CMS API server | Runs on localhost only. No external exposure |
| **Credentials** | `.env` + `secrets/` directory | GA4 service account JSON, GrowthBook keys |
| **Secrets guard** | `.gitignore` ignores `secrets/`, `.env` | Defense-in-depth, readFile blocks `.env` |
| **HITL protocol** | SOUL.md section 9-11 | Account creation, credential sharing, email — all require Hal approval |

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total pages** | 11 public + 4 admin |
| **API endpoints** | 8 (CMS API) + 2 (Astro API) + GA4 (3 functions) |
| **Admin tools** | 4 pages (login, variants, editor, results) + Vue Router SPA |
| **Dev scripts** | 11 scripts + 18 npm scripts |
| **DB tables** | 4 (variants, experiment_results, experiment_events, audit_log) |
| **Feature flags** | GrowthBook SDK + OpenFeature wrapper |
| **Analytics** | GA4 via Google service account |
| **Test suites** | Unit (Vitest), E2E (Playwright), Visual Regression, A11Y (axe), BDD (Cucumber) |
| **Audit tools** | Security (npm audit, CVEs), SEO (lychee), CI aggregator |
| **Quality gates** | Lint + TypeCheck + Unit Tests + Build + Audits |
| **Deploy method** | Custom Python → Cloudflare REST API |
