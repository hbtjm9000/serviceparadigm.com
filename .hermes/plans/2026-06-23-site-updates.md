# serviceparadigm.com — Site Updates (June 23, 2026)

**Goal:** 9-point site overhaul — content cleanup, contact consistency, WhatsApp bot research, scroll-to-top, 404 pages, admin MFA, branding workshop, promo metrics.

**Approach:** All changes on `main` branch, commit per task, push at end. Research tasks happen in parallel where possible.

---

## Task 1: AI page — Remove ML, Model Training, NLP

**File:** `src/components/services/AiStrategy.vue`

**What:** Remove capabilities entries 04 (ML Operations) and 05 (NLP Solutions) from the capabilities array. Renumber remaining entries (01→04 become 01→04).

**Before:**
```js
{ symbol: '04', title: 'ML Operations', description: 'Production ML pipelines, model monitoring...' },
{ symbol: '05', title: 'NLP Solutions', description: 'Natural language processing for document intelligence...' },
```

**After:** Remove those two entries. Renumber: 04→Computer Vision stays as 04.

**Verify:** `grep -c "ML Operations\|NLP Solutions" src/components/services/AiStrategy.vue` → 0

---

## Task 2: Solutions Architecture — Remove microservices language

**File:** `src/components/services/SolArch.vue`

**What:** Remove 'Microservices Design' from the features array (line 97).

**Before:**
```js
const features = [
  'Cloud Architecture',
  'Platform Modernization',
  'Integration Architecture',
  'Microservices Design',
  'API Strategy',
  'Data Architecture',
]
```

**After:**
```js
const features = [
  'Cloud Architecture',
  'Platform Modernization',
  'Integration Architecture',
  'API Strategy',
  'Data Architecture',
]
```

**Verify:** `grep -c "Microservices" src/components/services/SolArch.vue` → 0

---

## Task 3: Contact info consistency

**Files:**
- `src/components/ContactForm.astro` (line 39 — wrong number)
- Check all other files for email/phone consistency

**What:**
- ContactForm.astro line 39: Change `(876) 890-4060` → `(876) 371-8172` and `tel:+187****4060` → `tel:+1-876-371-8172`
- Verify contact.astro already has correct info (it does — hello@serviceparadigm.com + (876) 371-8172)
- Verify no other email/phone appears anywhere

**Verify:** Search for any email not hello@serviceparadigm.com and any phone not (876) 371-8172 across all src/ files.

---

## Task 4: Research WhatsApp bot for website footer

**Approach:** Web research + write findings.
- Research WhatsApp Business API / Cloud API options for website integration
- Check available tools for Jamaica market
- Evaluate: Twilio WhatsApp, direct WhatsApp Cloud API, WATI, etc.
- Write findings to a reference doc for implementation decision

**Deliverable:** `docs/whatsapp-bot-research.md` with option comparison table.

---

## Task 5: Scroll to top button

**Files:**
- Create: `src/components/ScrollToTop.astro`
- Modify: `src/layouts/BaseLayout.astro` (add component before `</body>`)

**What:** Floating button that:
- Only visible when scrolled below the fold (`scrollY > window.innerHeight`)
- Fixed position bottom-right
- Shows in footer area (stays visible if footer is visible)
- Smooth scroll to top on click
- Mobile-friendly sizing (min 44x44 touch target)

**Implementation:** Add to BaseLayout so it's available site-wide. Use event delegation pattern (consistent with existing codebase pattern for View Transitions compatibility).

---

## Task 6: 404 + other error pages with promotions

**Files to create:**
- `src/pages/404.astro`
- `src/pages/500.astro` (optional but good practice)

**What:** Custom error pages that:
- Match site design language (same header/footer)
- Show "signal" — current brand tone, clear messaging
- Display current promotions prominently (link to landings pages)
- 404: "Page not found" + search suggestions + promo cards
- 500: "Something went wrong" + CTA to contact

**Reference:** Existing landing pages for promo card pattern.

---

## Task 7: /admin → obscure URL with MFA

**Current state:** `/admin/index.astro` mounts a Vue SPA. `/admin/login.astro` uses hardcoded password `paradigm2026` in localStorage. User reports blank page.

**What:**
1. Debug why `/admin` shows blank (likely JS error in Vue SPA — check imports, router, missing deps)
2. Move admin from `/admin/*` to an obscure path like `/_paradigm/*` (choose with Hal)
3. Upgrade auth: implement server-side authentication via Cloudflare Worker (worker.ts) — OAuth (Google/GitHub) + PIN as second factor
4. Worker checks auth, serves admin app only when authenticated

**Options for obscure URL (present to Hal):**
| Option | URL | Notes |
|--------|-----|-------|
| A | `/_internal/*` | Simple underscore prefix, hard to guess |
| B | `/_paradigm/*` | Brand-aligned, still obscure |
| C | `/console/*` | Common pattern, less obscure |
| D | Custom UUID-based path | Maximum obscurity, annoying to remember |

---

## Task 8: Branding — "Paradigm" overuse → "Paradigm IT Services"

**Issue:** "Paradigm" appears standalone in multiple places, implying the company name is just "Paradigm" rather than "Paradigm IT Services."

**Locations found:**
- HeroClient.vue: `label: 'Engineering the Next Paradigm'` — this is the tagline, acceptable
- Mission.astro: `"wrong paradigm"` in quote — acceptable as word usage
- Insights.astro: `"The Zero Trust Protocol: A New Security Paradigm"` — acceptable
- Insights.astro: `"The Paradigm Summit 2024"` — acceptable
- Services.astro: `"Core Paradigms"` — this is using "Paradigm" as company branding standalone
- Footer.astro: `"Paradigm IT Services"` — correct

**Fix:**
- Services.astro line 40: Change `Core Paradigms` → `Core Services` or `Strategic Pillars`
- Replace any standalone "Paradigm" used as company shorthand with "Paradigm IT Services" or "ParaIT" (post-workshop)

### ParaIT Workshop — Name Options Scoring

Hal suggests **ParaIT** as abbreviation to avoid PITS. Need 4+ options scored.

| Option | Short form | Pros | Cons | Brand recall | Clarity | Score |
|--------|-----------|------|------|-------------|--------|-------|
| **ParaIT** | PIT | Short, logical, IT-reference | Sounds like "parrot" | High | Medium | ★★★★ |
| **ParIT** | PAT, PRT | Keeps "Par" prefix | Vowel dropped = less natural | Medium | Medium | ★★★ |
| **PIT Services** | PIT | Clarity (Services appended) | Too close to PITS | Low | High | ★★★ |
| **PRISM** | — | Distinctive, positive | Doesn't contain "Paradigm" | High | Low | ★★★ |
| **Pivot IT** | — | Conveys transformation | No brand connection to Paradigm | Medium | High | ★★ |
| **PARD** | — | Very short | Sounds like "Pard" = partner slang | Low | Low | ★★ |
| **PAI Services** | — | Clean, AI-friendly | Loses "Paradigm" entirely | Medium | Medium | ★★★★ |
| **ParaCorp** | — | Expandable beyond IT | Too generic | Medium | Low | ★★ |

**Recommended:** ParaIT (Hal's suggestion) — short, scannable, IT clear. Create one sentence brand usage guide: "First mention 'Paradigm IT Services (ParaIT)', thereafter 'ParaIT'."

---

## Task 9: Landing page URLs + promo metrics + A/B testing

**Current landing page URLs:**
| Landing | URL |
|---------|-----|
| Packaged AI | /landings/packaged-ai |
| Element (Digital Presence) | /landings/element |
| Digital Employee (JTDA) | /landings/digital-employee |

**Promo metrics mechanism:**

1. **UTM parameter tracking** — already possible with GA4, just document conventions
2. **Promo codes** — add a "promo_code" field to the ContactForm and the OrderCart.vue component
3. **Dedicated email addresses** — create per-campaign email aliases (e.g., `packaged-ai@serviceparadigm.com`, `digital-employee@serviceparadigm.com`) that forward to hello@
4. **A/B testing** — GrowthBook integration already exists in BaseLayout (feature flag bootstrap script). Use GrowthBook for landing page experiments

**Implementation:**
- Add promo_code field to ContactForm.vue (Vue component)
- Add promo_code to OrderCart.vue for order tracking
- Document UTM convention in README or docs/
- Set up GrowthBook experiment for landing page A/B testing

---

## Execution Order

1. Task 4: WhatsApp bot research (parallel research, non-blocking)
2. Tasks 1-3: Content edits (simple, fast)
3. Task 8: Branding workshop (decision needed before implementation)
4. Task 6: 404/error pages
5. Task 5: Scroll to top button
6. Task 7: Admin obscurity + MFA (most complex)
7. Task 9: Promo metrics + A/B testing

**Dependencies:** Task 8 (branding) may affect copy in Tasks 1-3 (re-check after abbreviation decision).

---

## Task 9: Promo Metrics + A/B Testing Plan

### Current Landing Pages

| Landing | URL | Purpose |
|---------|-----|---------|
| Packaged AI | `/landings/packaged-ai` | Fixed-price AI integration ($4,999) |
| Element | `/landings/element` | Digital Presence Starter ($997) |
| Digital Employee | `/landings/digital-employee` | AI workers for SMEs (launch offer) |

### Promo Metrics Mechanisms

**1. UTM Parameter Convention**

Document and enforce a standard UTM scheme so all campaign traffic is trackable:

| Parameter | Convention | Example |
|-----------|-----------|---------|
| `utm_source` | Platform name | `linkedin`, `google`, `email`, `whatsapp` |
| `utm_medium` | Traffic type | `social`, `cpc`, `email`, `direct` |
| `utm_campaign` | Campaign slug | `digital-employee-launch`, `packaged-ai-q3` |
| `utm_content` | Specific creative | `hero-cta-v1`, `sidebar-banner` |

Store in a `docs/utm-convention.md` reference doc.

**2. Promo Codes**

Add a `promo_code` field to:
- `src/components/ContactForm.vue` — promo code input on the consultation form
- `src/components/OrderCart.vue` — promo code on the order page

The promo code is submitted alongside the form data and logged in the transaction log (D1). Reports can then be queried: `SELECT promo_code, COUNT(*) FROM orders GROUP BY promo_code`.

**Implementation:**
- Add `promo_code` column to the orders and contact transaction tables (D1 migration 0003)
- Update ContactForm.vue to capture and submit promo_code
- Update OrderCart.vue to capture and submit promo_code
- Update worker.ts to persist promo_code in the transaction log

**3. Campaign Email Aliases**

Create per-campaign email aliases that forward to hello@serviceparadigm.com:
- `packaged-ai@serviceparadigm.com`
- `element@serviceparadigm.com`
- `digital-employee@serviceparadigm.com`
- `consult@serviceparadigm.com`

These can be set up in the domain's email provider (Google Workspace / MX forwarding). Each alias is unique to a campaign — when an inquiry comes in, you know which campaign drove it.

**4. GrowthBook A/B Testing**

GrowthBook is already wired into the site (BaseLayout bootstraps it). The experiments system at `/internala` is ready for managing variants.

**Proposed experiments for current landing pages:**

| Page | Variants to Test | Metric |
|------|-----------------|--------|
| `/landings/digital-employee` | Hero CTA: "See Pricing" vs "Book a Fit Call" vs "Start Free Trial" | CTA click rate |
| `/landings/packaged-ai` | Hero: headline focus on "cost savings" vs "capability" vs "speed" | Form submission rate |
| `/landings/element` | Pricing display: $997 setup+first-year vs $997 one-time vs monthly $29/mo | CTA click rate |
| Homepage hero | Headline variant: current vs "AI-Powered Infrastructure" vs "Digital Employees for Jamaica" | Hero CTA click rate (tracking via `experiment_hero_variant` localStorage key) |
| `/services/ai-strategy` | CTA: "Schedule Your Assessment" vs "Book a Discovery Call" vs "Start Your AI Journey" | CTA click rate |

**A/B testing workflow:**
1. Define experiment in GrowthBook dashboard (or via the admin experiments UI at `/internala`)
2. Configure variants with copy/content changes
3. Set traffic split (e.g., 50/50 or 70/30)
4. Run for minimum 2 weeks or 200 conversions per variant
5. Analyze results in GrowthBook stats engine
6. Declare winner, update page, archive experiment

### Implementation Phases

**Phase 1 — Foundation (1 day)**
- Create UTM convention doc at `docs/utm-convention.md`
- Add promo_code field to ContactForm.vue + OrderCart.vue
- Add promo_code to D1 schema (migration 0003)
- Set up campaign email aliases

**Phase 2 — A/B Experiments (2 days)**
- Set up GrowthBook experiments for top 2 landing pages
- Deploy variant tracking
- Run for 2 weeks minimum

**Phase 3 — Analytics (1 day)**
- Build a simple promotion effectiveness dashboard page under `/internala`
- Query promo code usage, experiment results, landing page conversion

