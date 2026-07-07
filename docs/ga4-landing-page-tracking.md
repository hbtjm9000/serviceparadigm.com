# GA4 Tracking Setup — Landing Pages & Campaigns

**Status:** Reference
**Property:** G-SLDE3K52MY
**Last Updated:** July 2026

---

## What Already Works (No Changes Needed)

The site already captures everything we need from entry page data:

| What | Where | Status |
|------|-------|--------|
| UTM params (`utm_source`, `utm_medium`, `utm_campaign`, etc.) | Captured from URL on page load, stored in sessionStorage | ✅ Already live |
| Page type classification (`home`, `landing`, `element`, etc.) | Sent with every `page_viewed` event | ✅ Already live |
| A/B test exposure logging | GrowthBook → GA4 via `experiment_viewed` event | ✅ Already live |
| Form submission tracking | `conversion` event with campaign params | ✅ Already live |
| Referral code capture (`referral_code`) | Captured from URL, sent with events | ✅ Added this session |
| Discount code capture (`discount_code`) | Captured from URL, sent with events | ✅ Added this session |

## What to Do in GA4 (Admin Panel)

### If You Want to See Campaign Codes in Reports

1. Go to **Google Analytics → Admin → Custom Definitions → Custom Dimensions**
2. Click **Create custom dimension**
3. Add these:

| Dimension Name | Scope | Event Parameter | When to Use |
|----------------|-------|----------------|-------------|
| `Referral Code` | Event | `referral_code` | Only if you want to run partner/referrer campaigns |
| `Discount Code` | Event | `discount_code` | Only if you want to track promo code redemptions |

4. Click **Save**

### If You Want Form Submissions as Conversions

1. Go to **Admin → Events → All Events**
2. Find `conversion` in the list
3. Toggle **Mark as conversion** to on

That's it. The code will handle the rest.

## How Campaign Links Should Look

When sharing a landing page on LinkedIn, email, or social:

```
https://serviceparadigm.com/landings/<campaign-name>/
  ?utm_source=linkedin
  &utm_medium=social
  &utm_campaign=july2026-automata-launch
  &referral_code=JTDA-June30
  &discount_code=LAUNCH10
```

All query params are optional. The analytics code only stores what's present — no extra work if you omit them.

## What the Code Now Captures

| Param | Example | Captured? | Stored? |
|-------|---------|-----------|---------|
| `utm_source` | `linkedin` | ✅ Yes | ✅ sessionStorage |
| `utm_medium` | `social` | ✅ Yes | ✅ sessionStorage |
| `utm_campaign` | `july2026-launch` | ✅ Yes | ✅ sessionStorage |
| `utm_term` | `ai-agents` | ✅ Yes | ✅ sessionStorage |
| `utm_content` | `hero-cta-v2` | ✅ Yes | ✅ sessionStorage |
| `referral_code` | `JTDA-June30` | ✅ Yes | ✅ sessionStorage |
| `discount_code` | `LAUNCH10` | ✅ Yes | ✅ sessionStorage |

All params persist across page navigation (via sessionStorage) and are sent with every event and form submission.

## Files Changed

- `src/lib/analytics.ts` — Added referral_code + discount_code capture, conversion event helper
- `src/components/ContactForm.vue` — Sends campaign params with form data

No other changes needed. The existing UTM and page classification remain untouched.
