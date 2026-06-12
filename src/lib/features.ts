/**
 * features.ts — OpenFeature-compatible feature flag client
 *
 * Vendor-agnostic wrapper around the GrowthBook SDK. All application code
 * speaks this API. To switch vendors, rewrite the internals here —
 * every consumer stays unchanged.
 *
 * API design mirrors @openfeature/web-sdk conventions for familiarity:
 *   getStringValue(), getBooleanValue(), getNumberValue(), getObjectValue()
 *
 * Future: Swap to true OpenFeature provider when a client-side GrowthBook
 * provider becomes available (@openfeature/growthbook-provider is server-only).
 *
 * Usage:
 *   import { getFlag, isOn } from '@/lib/features';
 *   const heroVariant = getFlag('hero-copy-test', 'v1-baseline');
 *   if (isOn('new-feature')) { ... }
 */

import { growthbook } from './growthbook';

// ─── Feature Flag Reader ────────────────────────────────────────

/**
 * Get a string feature flag value.
 * Returns `defaultValue` if the flag doesn't exist or hasn't loaded.
 *
 * Mirror of: OpenFeature Client.getStringValue()
 */
export function getStringValue<T extends string = string>(
  key: string,
  defaultValue: T,
): T {
  try {
    return growthbook.getFeatureValue(key, defaultValue) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Get a boolean feature flag value.
 * Returns `defaultValue` if the flag doesn't exist.
 *
 * Mirror of: OpenFeature Client.getBooleanValue()
 */
export function getBooleanValue(
  key: string,
  defaultValue = false,
): boolean {
  try {
    return growthbook.isOn(key);
  } catch {
    return defaultValue;
  }
}

/**
 * Get a number feature flag value.
 * Returns `defaultValue` if the flag doesn't exist or is not a number.
 *
 * Mirror of: OpenFeature Client.getNumberValue()
 */
export function getNumberValue(
  key: string,
  defaultValue: number,
): number {
  try {
    const val = growthbook.getFeatureValue(key, defaultValue);
    return typeof val === 'number' ? val : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Get an object feature flag value.
 * Returns `defaultValue` if the flag doesn't exist.
 *
 * Mirror of: OpenFeature Client.getObjectValue()
 */
export function getObjectValue<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
): T {
  try {
    const val = growthbook.getFeatureValue(key, defaultValue);
    return (typeof val === 'object' && val !== null ? val : defaultValue) as T;
  } catch {
    return defaultValue;
  }
}

// ─── Convenience Shorthands ─────────────────────────────────────

/** Shorthand for getStringValue */
export function getFlag<T extends string = string>(
  key: string,
  defaultValue: T,
): T {
  return getStringValue(key, defaultValue);
}

/** Returns true if the boolean feature flag is on */
export function isOn(key: string): boolean {
  // Dev: always show features for testing
  if (import.meta.env.DEV) return true;
  // Production: use GrowthBook evaluation
  return getBooleanValue(key, false);
}

/** Returns true if the boolean feature flag is off */
export function isOff(key: string): boolean {
  return !getBooleanValue(key, false);
}

// ─── For backwards compatibility with existing growthbook.ts imports ──
export { growthbook } from './growthbook';
