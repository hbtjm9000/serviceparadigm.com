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
