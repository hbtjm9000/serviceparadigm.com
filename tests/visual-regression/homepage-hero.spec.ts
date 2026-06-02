/**
 * Visual Regression Test — Homepage Hero
 * 
 * Captures screenshot of homepage for visual comparison across copy variants.
 * Run: bunx playwright test tests/visual-regression/homepage-hero.spec.ts
 * 
 * Note: This test captures a baseline screenshot. To compare variants:
 * 1. Clear localStorage before each run: await page.evaluate(() => localStorage.clear())
 * 2. Run multiple times to capture different variant screenshots
 * 3. Compare manually or use pixel-diff tools
 */

import { test, expect } from '@playwright/test';

test('homepage hero screenshot (baseline)', async ({ page }) => {
  // Navigate to homepage
  await page.goto('/', { waitUntil: 'networkidle' });
  
  // Wait for Vue component to hydrate
  await page.waitForTimeout(2000);
  
  // Capture hero section
  const hero = page.locator('section.bg-tertiary');
  await expect(hero).toBeVisible();
  
  // Take screenshot
  await hero.screenshot({
    path: 'tests/visual-regression/screenshots/hero-baseline.png',
    type: 'png',
  });
  
  // Verify headline is visible
  const headline = page.locator('h1.font-serif');
  await expect(headline).toBeVisible();
  
  // Log which variant is showing (for manual tracking)
  const variant = await page.evaluate(() => {
    return localStorage.getItem('exp:hero-copy-test');
  });
  
  console.log(`[Visual Test] Hero variant: ${variant}`);
  
  // Pass if headline exists (variant comparison is manual)
  expect(await headline.textContent()).toBeTruthy();
});

test('homepage hero — variant comparison (clear storage)', async ({ page }) => {
  // Clear localStorage to force new random assignment
  await page.evaluate(() => localStorage.clear());
  
  // Navigate to homepage
  await page.goto('/', { waitUntil: 'networkidle' });
  
  // Wait for Vue component to hydrate
  await page.waitForTimeout(2000);
  
  // Capture hero section with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const hero = page.locator('section.bg-tertiary');
  
  await hero.screenshot({
    path: `tests/visual-regression/screenshots/hero-${timestamp}.png`,
    type: 'png',
  });
  
  // Log variant
  const variant = await page.evaluate(() => {
    return localStorage.getItem('exp:hero-copy-test');
  });
  
  console.log(`[Visual Test] New variant assigned: ${variant}`);
  
  // Verify headline exists
  const headline = page.locator('h1.font-serif');
  expect(await headline.textContent()).toBeTruthy();
});
