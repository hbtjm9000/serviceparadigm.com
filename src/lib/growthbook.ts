import { GrowthBook } from '@growthbook/growthbook';
import type { WidenPrimitives } from '@growthbook/growthbook';

export const growthbook = new GrowthBook({
  apiHost: import.meta.env.PUBLIC_GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io',
  clientKey: import.meta.env.PUBLIC_GROWTHBOOK_CLIENT_KEY,
  enableDevMode: import.meta.env.DEV,
  trackingCallback: (experiment, result) => {
    // Send to GA4, Plausible, or custom analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'experiment_viewed', {
        experiment_id: experiment.key,
        variation_id: result.variationId,
      });
    }
  },
});

// Initialize on client-side only
if (typeof window !== 'undefined') {
  (async () => {
    try {
      await growthbook.loadFeatures();
    } catch {
      // Suppress — initialization errors are non-critical
    }
  })();
}

export function getFeatureValue<V = string>(key: string, defaultValue: V): WidenPrimitives<V> {
  return growthbook.getFeatureValue(key, defaultValue);
}

export function isFeatureOn(key: string): boolean {
  return growthbook.isOn(key);
}

export function isFeatureOff(key: string): boolean {
  return growthbook.isOff(key);
}
