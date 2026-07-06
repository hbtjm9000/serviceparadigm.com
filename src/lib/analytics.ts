/**
 * Analytics utility — UTM capture, campaign tracking, GA4 events.
 *
 * UTM params and campaign codes are captured once on page load and stored
 * in sessionStorage so they persist across navigation (Astro client-side
 * transitions) and can be attached to form submissions.
 *
 * Landing page tracking: referral_code and discount_code are captured
 * alongside UTMs and sent with every event and form submission.
 */

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | undefined;
}

export interface CampaignParams extends UtmParams {
  referral_code?: string;
  discount_code?: string;
}

export interface PageInfo {
  pageType: string;    // 'home' | 'landing' | 'element' | 'service' | 'insight' | 'about' | 'contact' | 'other'
  pageSubtype: string; // e.g. 'automata-sme' — campaign or section identifier
  pageName: string;    // path-based slug, e.g. 'landings/automata-sme'
  url: string;
}

const PARAM_STORAGE_KEY = 'sp:campaign';

/**
 * Extract UTM + campaign params from a URL's search params.
 */
function extractCampaignParams(search: string): CampaignParams {
  const params = new URLSearchParams(search);
  const campaign: CampaignParams = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'referral_code', 'discount_code']) {
    const val = params.get(key);
    if (val) campaign[key] = val;
  }
  return campaign;
}

/**
 * Classify a URL path into a page info object with sub-type.
 */
function classifyPage(path: string): PageInfo {
  const clean = path.replace(/\/$/, '') || '/';

  // Landing pages — extract campaign name from path
  if (clean.startsWith('/landings/')) {
    const slug = clean.replace('/landings/', '');
    const subtype = slug.split('/')[0] || 'general';
    return { pageType: 'landing', pageSubtype: subtype, pageName: clean.slice(1), url: clean };
  }

  // Treat /digital-employees and /automata as landing-type pages
  if (clean === '/digital-employees') return { pageType: 'landing', pageSubtype: 'digital-employees', pageName: 'digital-employees', url: clean };
  if (clean === '/automata') return { pageType: 'landing', pageSubtype: 'automata', pageName: 'automata', url: clean };

  if (clean === '/') return { pageType: 'home', pageSubtype: '', pageName: 'home', url: clean };
  if (clean.startsWith('/elements/')) return { pageType: 'element', pageSubtype: clean.replace('/elements/', ''), pageName: clean.slice(1), url: clean };
  if (clean.startsWith('/services/')) return { pageType: 'service', pageSubtype: clean.replace('/services/', ''), pageName: clean.slice(1), url: clean };
  if (clean.startsWith('/insights')) return { pageType: 'insight', pageSubtype: 'blog', pageName: clean.slice(1), url: clean };
  if (clean === '/about') return { pageType: 'about', pageSubtype: '', pageName: 'about', url: clean };
  if (clean === '/contact') return { pageType: 'contact', pageSubtype: '', pageName: 'contact', url: clean };

  return { pageType: 'other', pageSubtype: '', pageName: clean.slice(1), url: clean };
}

/**
 * Initialize analytics on page load.
 * Captures UTM + campaign params, sends page_type tracking event.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Capture campaign params once per session
  const existing = sessionStorage.getItem(PARAM_STORAGE_KEY);
  if (!existing) {
    const params = extractCampaignParams(window.location.search);
    if (Object.keys(params).length > 0) {
      sessionStorage.setItem(PARAM_STORAGE_KEY, JSON.stringify(params));
    }
  }

  // Send page type tracking event
  const page = classifyPage(window.location.pathname);
  if (window.gtag) {
    window.gtag('event', 'page_viewed', {
      page_type: page.pageType,
      page_subtype: page.pageSubtype,
      page_name: page.pageName,
      page_location: page.url,
      ...getCampaignParams(),
    });
  }
}

/**
 * Get stored campaign params (empty object if none captured).
 */
export function getCampaignParams(): CampaignParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(PARAM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** @deprecated Use getCampaignParams() instead */
export function getUtmParams(): UtmParams {
  const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = getCampaignParams();
  return { utm_source, utm_medium, utm_campaign, utm_term, utm_content };
}

/**
 * Track a GA4 event with campaign params and page context.
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | undefined>,
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const page = classifyPage(window.location.pathname);
  window.gtag('event', name, {
    page_type: page.pageType,
    page_subtype: page.pageSubtype,
    page_name: page.pageName,
    page_location: window.location.href,
    ...getCampaignParams(),
    ...params,
  });
}

/**
 * Track a conversion event (form submission, booking, referral sign-up).
 * Automatically includes campaign params (UTM + referral + discount codes).
 * Call this when a visitor completes a high-value action.
 *
 * @param conversionType - 'form_submit' | 'booking_booked' | 'referral_signup' | 'cta_clicked'
 * @param extraParams   - Additional context (e.g. { form_id: 'contact', experiment_variant: 'B' })
 */
export function trackConversion(
  conversionType: 'form_submit' | 'booking_booked' | 'referral_signup' | 'cta_clicked',
  extraParams?: Record<string, string | number | undefined>,
): void {
  trackEvent('conversion', {
    conversion_type: conversionType,
    ...extraParams,
  });
}
