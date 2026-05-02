/**
 * P0 Critical Test Suite — serviceparadigm.com
 * Launch integrity: route availability, contact consistency, legal content, brand rules.
 *
 * Run: bunx playwright test tests/p0-critical.spec.ts
 * (Pre-req: bun run build && bun run preview --port 4321 in background)
 */
import { test, expect } from '@playwright/test';

const PAGES = [
  '/',
  '/about/',
  '/services/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/accessibility/',
  '/elements/',
  '/insights/',
  '/landings/element/',
  '/landings/packaged-ai/',
];

const CANONICAL_EMAIL = 'hello@serviceparadigm.com';

test.describe('P0 Critical: Launch Integrity', () => {

  // ── Route Integrity ──────────────────────────────────────────────────────
  test.describe('Route Integrity', () => {
    for (const path of PAGES) {
      test(`${path} returns HTTP 200`, async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        // Sanity: page body is not empty
        await expect(page.locator('body')).not.toBeEmpty();
      });
    }
  });

  // ── Contact Email Consistency ────────────────────────────────────────────
  /**
   * Verifies every mailto: link across the site resolves to the single
   * canonical address. Footer has no mailto: link — its email icon links
   * to /contact. This test scans all pages for mailto: hrefs and asserts
   * each matches CANONICAL_EMAIL.
   */
  test('Contact Email: all mailto: links resolve to hello@serviceparadigm.com', async ({ page }) => {
    const mailtos = new Set<string>();

    for (const path of PAGES) {
      await page.goto(path);
      const links = await page.locator('a[href^="mailto:"]').all();
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href) mailtos.add(href.replace('mailto:', '').toLowerCase());
      }
    }

    expect(mailtos.size).toBeGreaterThanOrEqual(1);
    for (const addr of mailtos) {
      expect(addr).toBe(CANONICAL_EMAIL);
    }
  });

  /**
   * Contact page must display the canonical email address visibly in the UI
   * (not just in a mailto: href).
   */
  test('Contact Page: canonical email is visible as text', async ({ page }) => {
    await page.goto('/contact/');
    const emailText = page.locator('text=' + CANONICAL_EMAIL);
    await expect(emailText).toBeVisible();
  });

  // ── Legal Presence ───────────────────────────────────────────────────────
  test.describe('Legal Presence', () => {
    for (const path of ['/privacy/', '/terms/']) {
      test(`${path} has substantive content + brand name`, async ({ page }) => {
        await page.goto(path);
        const bodyText = await page.innerText('body');

        // Must not be a bare template (industry standard minimum ~500 chars)
        expect(bodyText.length).toBeGreaterThan(500);

        // Must mention the legal entity name
        expect(bodyText).toContain('Paradigm IT Services');
      });
    }
  });

  // ── Zero Border-Radius Brand Audit ───────────────────────────────────────
  /**
   * Brand rule: "Digital Lithograph" aesthetic requires zero border-radius
   * on all interactive elements. This targets brand-critical components
   * (header nav, hero CTAs, service cards on core pages — NOT landing pages
   * which are intentionally promotional).
   *
   * Skips: packaged-ai.astro, element.astro (promo/landing pages).
   */
  test('Brand Audit: brand elements have zero border-radius', async ({ page }) => {
    const BRAND_PAGES = ['/', '/about/', '/services/', '/contact/'];

    for (const path of BRAND_PAGES) {
      await page.goto(path);

      // Check buttons, inputs, and links that act as CTAs
      const interactive = page.locator('button, input[type="text"], input[type="email"], input[type="tel"], a[href="/contact"], a[href="/services"]');
      const count = await interactive.count();

      for (let i = 0; i < count; i++) {
        const el = interactive.nth(i);
        // Skip hidden elements
        if (!(await el.isVisible())) continue;

        const radius = await el.evaluate((node: Element) => {
          const s = getComputedStyle(node);
          // border-radius on the element itself
          if (s.borderRadius !== '0px') return s.borderRadius;
          // or on a parent wrapper (common for Tailwind utility patterns)
          const parent = (node as HTMLElement).closest('[class*="rounded"]');
          if (parent) return getComputedStyle(parent).borderRadius;
          return '0px';
        });

        expect(radius).toBe('0px');
      }
    }
  });

  // ── Newsletter Success State ─────────────────────────────────────────────
  /**
   * After submitting the newsletter form, a visible success confirmation
   * must appear. The component sets submitted.value = true but the template
   * must render it — this is the functional gap.
   */
  test('Newsletter: success state is visible after submit (simulated)', async ({ page }) => {
    await page.goto('/');

    // Fill and submit with a real-looking address
    await page.fill('#newsletter-email', 'test@techcorp.io');
    await page.click('button[type="submit"]');

    // Wait for the success message to appear (up to 5s)
    await expect(page.locator('text=/successfully|connected|subscribed|thank you/i')).toBeVisible({ timeout: 5000 });
  });

  // ── Contact Form Success State ───────────────────────────────────────────
  /**
   * After submitting the contact form, a visible success confirmation
   * must appear.
   */
  test('Contact Form: success state is visible after submit (simulated)', async ({ page }) => {
    await page.goto('/contact/');

    await page.fill('#name', 'Alice Chen');
    await page.fill('#email', 'alice@venture.io');
    await page.fill('#company', 'Nexus Labs');
    await page.selectOption('#service', 'ai-strategy');
    await page.fill('#message', 'Interested in AI architecture consulting.');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/thank you|received|contact|we.*touch/i')).toBeVisible({ timeout: 5000 });
  });

  // ── OG Meta on All Pages ─────────────────────────────────────────────────
  test.describe('SEO Meta', () => {
    for (const path of ['/', '/about/', '/services/', '/contact/']) {
      test(`${path} has og:image meta tag`, async ({ page }) => {
        await page.goto(path);
        const og = page.locator('meta[property="og:image"]');
        await expect(og).toHaveAttribute('content', /./);
      });
    }
  });
});
