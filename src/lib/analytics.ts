/**
 * Analytics utility — UTM capture, page type tracking, GA4 events.
 *
 * UTM params are captured once on page load and stored in sessionStorage
 * so they persist across navigation (Astro client-side transitions).
 */

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | undefined;
}

export interface PageInfo {
  pageType: string;    // 'home' | 'landing' | 'element' | 'service' | 'insight' | 'about' | 'contact' | 'other'
  pageName: string;    // path-based slug, e.g. 'landings/digital-employee'
  url: string;
}

const UTM_STORAGE_KEY = 'sp:utm';

/**
 * Extract UTM params from a URL's search params.
 */
function extractUtmParams(search: string): UtmParams {
  const params = new URLSearchParams(search);
  const utm: UtmParams = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  return utm;
}

/**
 * Classify a URL path into a page type.
 */
function classifyPage(path: string): PageInfo {
  const clean = path.replace(/\/$/, '') || '/';

  if (clean === '/') return { pageType: 'home', pageName: 'home', url: clean };
  if (clean.startsWith('/landings/')) return { pageType: 'landing', pageName: clean.slice(1), url: clean };
  if (clean.startsWith('/elements/')) return { pageType: 'element', pageName: clean.slice(1), url: clean };
  if (clean.startsWith('/services/')) return { pageType: 'service', pageName: clean.slice(1), url: clean };
  if (clean.startsWith('/insights')) return { pageType: 'insight', pageName: clean.slice(1), url: clean };
  if (clean === '/about') return { pageType: 'about', pageName: 'about', url: clean };
  if (clean === '/contact') return { pageType: 'contact', pageName: 'contact', url: clean };

  return { pageType: 'other', pageName: clean.slice(1), url: clean };
}

/**
 * Initialize analytics on page load.
 * Captures UTM params, sends page_type tracking event.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Capture UTM params once per session
  const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (!existing) {
    const utm = extractUtmParams(window.location.search);
    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    }
  }

  // Send page type tracking event
  const page = classifyPage(window.location.pathname);
  if (window.gtag) {
    window.gtag('event', 'page_viewed', {
      page_type: page.pageType,
      page_name: page.pageName,
      page_location: page.url,
      ...getUtmParams(),
    });
  }
}

/**
 * Get stored UTM params (empty object if none captured).
 */
export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Track a GA4 event with UTM params and page context.
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | undefined>,
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const page = classifyPage(window.location.pathname);
  window.gtag('event', name, {
    page_type: page.pageType,
    page_name: page.pageName,
    page_location: window.location.href,
    ...getUtmParams(),
    ...params,
  });
}
