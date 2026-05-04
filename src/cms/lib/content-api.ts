/**
 * Content API - CRUD operations for experiment variants
 * 
 * This module provides a local API for managing experiment variants.
 * In development, it reads/writes directly to JSON files.
 * In production, it fetches from the build-time generated content.
 */

import type { ExperimentVariant, VariantKey } from '@/composables/useExperiment';

const VARIANTS_PATH = '/src/content/hero/variants.json';

/**
 * Fetch all variants for an experiment
 */
export async function getVariants(experimentKey: string = 'hero'): Promise<Record<string, ExperimentVariant>> {
  try {
    // In development, fetch the JSON file directly
    const response = await fetch(`/src/content/hero/variants.json?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch variants: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching variants:', error);
    // Fallback to import (production build)
    const variants = await import('@/content/hero/variants.json');
    return variants.default;
  }
}

/**
 * Save variants back to the file system
 * This only works in development mode with a local server
 */
export async function saveVariants(
  experimentKey: string,
  variants: Record<string, ExperimentVariant>
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, this would call an API endpoint
    // For now, we'll use a POST to a hypothetical save endpoint
    const response = await fetch('/api/cms/save-variants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        experimentKey,
        variants,
      }),
    });

    if (!response.ok) {
      throw new Error(`Save failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving variants:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a new variant
 */
export async function createVariant(
  experimentKey: string,
  key: string,
  variant: ExperimentVariant
): Promise<{ success: boolean; error?: string }> {
  const currentVariants = await getVariants(experimentKey);
  
  if (currentVariants[key]) {
    return {
      success: false,
      error: `Variant '${key}' already exists`,
    };
  }

  return saveVariants(experimentKey, {
    ...currentVariants,
    [key]: variant,
  });
}

/**
 * Update an existing variant
 */
export async function updateVariant(
  experimentKey: string,
  key: string,
  variant: Partial<ExperimentVariant>
): Promise<{ success: boolean; error?: string }> {
  const currentVariants = await getVariants(experimentKey);
  
  if (!currentVariants[key]) {
    return {
      success: false,
      error: `Variant '${key}' not found`,
    };
  }

  return saveVariants(experimentKey, {
    ...currentVariants,
    [key]: {
      ...currentVariants[key],
      ...variant,
    },
  });
}

/**
 * Delete a variant
 */
export async function deleteVariant(
  experimentKey: string,
  key: string
): Promise<{ success: boolean; error?: string }> {
  const currentVariants = await getVariants(experimentKey);
  
  if (!currentVariants[key]) {
    return {
      success: false,
      error: `Variant '${key}' not found`,
    };
  }

  const { [key]: _, ...remaining } = currentVariants;
  
  if (Object.keys(remaining).length === 0) {
    return {
      success: false,
      error: 'Cannot delete the last variant',
    };
  }

  return saveVariants(experimentKey, remaining);
}
