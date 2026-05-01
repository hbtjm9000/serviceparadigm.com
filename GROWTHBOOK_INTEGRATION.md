# GrowthBook Integration Plan

## Overview

GrowthBook is an open-source feature flag and A/B testing platform. Integrating it into serviceparadigm.com enables:
- **Controlled experiments** (A/B/n tests) on UI variants, copy, CTAs
- **Feature flags** for gradual rollouts, kill switches, environment gating
- **Analytics-driven decisions** with statistical significance tracking
- **No redeploy** for flag changes — toggle via GrowthBook UI

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     serviceparadigm.com                         │
├─────────────────────────────────────────────────────────────────┤
│  Astro (SSR/SSG)           Vue 3 Components (client:load)       │
│  - Root layout             - ContactForm.vue                    │
│  - Header.astro            - Newsletter.vue                     │
│  - Pages                   - Client-side experiments            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ GrowthBook JS SDK
                              │ (fetch SDK context)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GrowthBook Cloud / Self-hosted               │
│  - Feature Flags (logoVariant, ctaText, pricingTier)            │
│  - Experiments (A/B test definitions)                           │
│  - Analytics (conversion tracking, MDE, significance)           │
│  - Audience Targeting (URL, device, geo, custom attributes)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Webhook / API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Apps Script / GA4                     │
│  - Form submission events                                       │
│  - Custom conversion events                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: SDK Installation & Context Setup

### 1.1 Install GrowthBook JS SDK

```bash
cd ~/lab/serviceparadigm.com
bun add @growthbook/growthbook
bun add -d @types/growthbook  # if using TypeScript types
```

### 1.2 Create GrowthBook Context Provider

**File:** `src/lib/growthbook.ts`

```typescript
import { GrowthBook } from '@growthbook/growthbook';

export const growthbook = new GrowthBook({
  apiHost: import.meta.env.PUBLIC_GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io',
  clientKey: import.meta.env.PUBLIC_GROWTHBOOK_CLIENT_KEY,
  enableDevMode: import.meta.env.DEV,
  trackingCallback: (experiment, result) => {
    // Send to GA4, Plausible, or custom analytics
    window.gtag?.('event', 'experiment_viewed', {
      experiment_id: experiment.key,
      variation_id: result.variationId,
    });
  },
});

// Initialize on client-side
if (typeof window !== 'undefined') {
  growthbook
    .loadFeatures()
    .then(() => console.log('[GrowthBook] Features loaded'))
    .catch(err => console.error('[GrowthBook] Load failed:', err));
}

export function getFeatureValue<T>(key: string, defaultValue: T): T {
  return growthbook.getFeatureValue(key, defaultValue);
}

export function isExperimentRunning(key: string): boolean {
  return growthbook.isRunning(key);
}
```

### 1.3 Environment Variables

**File:** `.env` (add to `.gitignore`)

```env
PUBLIC_GROWTHBOOK_API_HOST=https://cdn.growthbook.io
PUBLIC_GROWTHBOOK_CLIENT_KEY=your_client_key_from_growthbook
```

**File:** `.env.example` (commit this)

```env
PUBLIC_GROWTHBOOK_API_HOST=https://cdn.growthbook.io
PUBLIC_GROWTHBOOK_CLIENT_KEY=
```

---

## Phase 2: Feature Flag Definitions

### 2.1 Logo Variant Experiment

**GrowthBook Feature Key:** `logo-variant-test`

**Variations:**
| Variation | Value | Weight |
|-----------|-------|--------|
| Control (A) | `mono-white` | 50% |
| Variant (B) | `colored` | 25% |
| Variant (C) | `mono-teal` | 25% |

**Usage in Header.astro:**

```astro
---
import { getFeatureValue } from '../lib/growthbook';

interface Props {
  logoVariant?: 'colored' | 'mono-white' | 'mono-teal' | 'grayscale';
}

// Default fallback if GrowthBook not loaded
const { logoVariant: propVariant = 'mono-white' } = Astro.props;

// Override with GrowthBook flag if experiment is running
const gbVariant = getFeatureValue('logo-variant-test', propVariant);
const logoVariant = gbVariant;
---

<a href="/" class="flex items-center">
  <img
    src={`/images/paradigm-logo-header-${logoVariant}.png`}
    alt="Paradigm IT Services"
    width="200"
    height="45"
    class="h-10 w-auto object-contain"
  />
</a>
```

### 2.2 CTA Button Text Test

**Feature Key:** `homepage-cta-text`

**Variations:**
| Variation | Value |
|-----------|-------|
| Control | `START YOUR TRANSFORMATION` |
| Variant A | `BEGIN YOUR TRANSFORMATION` |
| Variant B | `ENGINEER YOUR FUTURE` |

---

## Phase 3: Vue Component Integration

### 3.1 Newsletter Form Experiment

**File:** `src/components/Newsletter.vue`

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getFeatureValue } from '../lib/growthbook';

const submitButtonText = ref('SUBMIT');

onMounted(() => {
  const variant = getFeatureValue('newsletter-button-test', 'control');
  submitButtonText.value = variant === 'variant-a' ? 'JOIN NETWORK' : 'SUBMIT';
});
</script>

<template>
  <button type="submit">
    {{ submitButtonText }}
  </button>
</template>
```

### 3.2 Contact Form Placeholder Test

**Feature Key:** `contact-form-placeholder`

Test different email placeholder text:
- `you@company.com` (control)
- `encrypted@email.address` (variant)

---

## Phase 4: Experiment Tracking & Analytics

### 4.1 Conversion Events

Define conversion events in GrowthBook:
- `form_submitted` — Contact form success
- `newsletter_subscribed` — Newsletter signup
- `cta_clicked` — Hero CTA click
- `page_view_services` — Services page visit

### 4.2 Tracking Implementation

**File:** `src/lib/analytics.ts`

```typescript
export function trackConversion(event: string, properties?: Record<string, any>) {
  // GA4
  window.gtag?.('event', event, properties);
  
  // GrowthBook (for experiment attribution)
  window.growthbook?.track(event, properties);
}
```

**Usage in ContactForm.vue:**

```typescript
const handleSubmit = async () => {
  // ... existing logic ...
  
  if (result.success) {
    trackConversion('form_submitted', {
      service: form.service,
      variant: getFeatureValue('contact-form-variant', 'control'),
    });
  }
};
```

---

## Phase 5: CI/CD Integration

### 5.1 GitHub Actions Workflow

**File:** `.github/workflows/growthbook-sync.yml`

```yaml
name: GrowthBook Feature Sync

on:
  push:
    branches: [main]

jobs:
  sync-features:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
      
      - name: Install deps
        run: bun install
      
      - name: Validate feature flags
        run: |
          bun run build
          # Optional: Run GrowthBook SDK validation
          # bunx growthbook validate
```

### 5.2 Preview Deployments

For Vercel/Netlify preview deployments:
- Use GrowthBook **environments** (dev, staging, prod)
- Set `PUBLIC_GROWTHBOOK_API_HOST` per environment
- Flag changes in dev don't affect prod

---

## Phase 6: Privacy & Compliance

### 6.1 GDPR/CCPA Considerations

- GrowthBook JS SDK does **not** set cookies by default
- No PII sent to GrowthBook (use anonymous IDs only)
- Add GrowthBook to privacy policy as analytics tool

### 6.2 Consent Mode

```typescript
// Only load GrowthBook after consent
if (consentGiven('analytics')) {
  growthbook.loadFeatures();
}
```

---

## Implementation Checklist

- [ ] **Phase 1**
  - [ ] Install `@growthbook/growthbook`
  - [ ] Create `src/lib/growthbook.ts`
  - [ ] Add `.env` with API credentials
  - [ ] Test SDK initialization in dev

- [ ] **Phase 2**
  - [ ] Create GrowthBook account (cloud or self-host)
  - [ ] Define `logo-variant-test` feature flag
  - [ ] Update `Header.astro` to use flag
  - [ ] Verify all 4 logo variants still accessible

- [ ] **Phase 3**
  - [ ] Integrate into `Newsletter.vue`
  - [ ] Integrate into `ContactForm.vue`
  - [ ] Test client-side hydration

- [ ] **Phase 4**
  - [ ] Define conversion events in GrowthBook
  - [ ] Implement `trackConversion()` helper
  - [ ] Wire form success events
  - [ ] Verify events appear in GrowthBook dashboard

- [ ] **Phase 5**
  - [ ] Add GitHub Actions workflow
  - [ ] Configure environments (dev/staging/prod)
  - [ ] Test preview deployment flags

- [ ] **Phase 6**
  - [ ] Update privacy policy
  - [ ] Add consent gate if required
  - [ ] Document data flow for compliance audit

---

## Estimated Effort

| Phase | Complexity | Time Estimate |
|-------|------------|---------------|
| Phase 1: SDK Setup | Low | 2-3 hours |
| Phase 2: Feature Flags | Low | 1-2 hours |
| Phase 3: Vue Integration | Medium | 3-4 hours |
| Phase 4: Analytics | Medium | 2-3 hours |
| Phase 5: CI/CD | Low | 1-2 hours |
| Phase 6: Compliance | Low | 1 hour |
| **Total** | | **10-15 hours** |

---

## Next Steps

1. **Create GrowthBook account** — cloud.growthbook.io (free tier: 3M API calls/mo)
2. **Get API credentials** — Client Key + API Host
3. **Authorize Phase 1** — I'll install SDK and create context provider
4. **Test locally** — Verify flags override works
5. **Deploy to staging** — Run first A/B test (logo variants)
6. **Review results** — After 1000+ visitors, check statistical significance

---

## References

- GrowthBook Docs: https://docs.growthbook.io/
- JS SDK: https://docs.growthbook.io/lib/js
- Astro Integration: https://docs.growthbook.io/lib/js#astro
- Vue Integration: https://docs.growthbook.io/lib/js#vue
