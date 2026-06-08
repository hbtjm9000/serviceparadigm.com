/**
 * useExperiment - Vue 3 composable for client-side A/B testing
 * 
 * Features:
 * - Random assignment to variants
 * - localStorage persistence (same user sees same variant across visits)
 * - Automatic experiment exposure logging (GA4 compatible)
 * - Type-safe variant selection
 * 
 * Usage:
 *   const variant = useExperiment('hero-copy-test', ['v1-baseline', 'v2-editorial', 'v3-direct']);
 *   const copy = computed(() => variants[variant]);
 */

// Type definitions for experiment variants
export interface ExperimentVariant {
  label: string;
  headline: string;
  headline_highlight: string;
  cta_text: string;
  subheadline: string;
  [key: string]: string;
}

export function useExperiment(experimentKey: string, variants: string[]): string {
  const storageKey = `exp:${experimentKey}`;
  
  // Check localStorage first (persistent assignment)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && variants.includes(stored)) {
        // Log exposure on every page load (for GA4 tracking)
        logExposure(experimentKey, stored);
        return stored;
      }
    } catch (e) {
      console.warn(`[Experiment] localStorage read failed for ${storageKey}:`, e);
    }
  }
  
  // Random assignment
  const variant = variants[Math.floor(Math.random() * variants.length)];
  
  // Persist for next visit
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, variant);
    } catch (e) {
      console.warn(`[Experiment] localStorage write failed for ${storageKey}:`, e);
    }
  }
  
  // Log exposure
  logExposure(experimentKey, variant);
  
  return variant;
}

/**
 * Log experiment exposure to console and GA4 (if available)
 */
function logExposure(experimentKey: string, variant: string): void {
  // Console log for manual review
  console.log(`[Experiment] ${experimentKey}: ${variant}`);
  
  // Send to GA4 (if gtag is loaded)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'experiment_viewed', {
      experiment_id: experimentKey,
      variation_id: variant,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

/**
 * Log conversion event (call this on form submission, CTA click, etc.)
 */
export function logConversion(experimentKey: string, variant: string, conversionType: string): void {
  console.log(`[Conversion] ${experimentKey}: ${variant} → ${conversionType}`);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', conversionType, {
      experiment_id: experimentKey,
      variation_id: variant,
      page_location: window.location.href,
    });
  }
}

// TypeScript declaration for GA4 gtag
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}
