import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test('page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/contact/');
    await expect(page).toHaveTitle(/Contact/);
    expect(errors).toHaveLength(0);
  });

  test('contact form renders all fields', async ({ page }) => {
    await page.goto('/contact/');

    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#company')).toBeVisible();
    await expect(page.locator('#service')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('form shows success state after submit (simulation)', async ({ page }) => {
    await page.goto('/contact/');

    await page.fill('#name', 'Jane Doe');
    await page.fill('#email', 'jane@example.com');
    await page.fill('#company', 'Acme Corp');
    await page.selectOption('#service', 'ai-strategy');
    await page.fill('#message', 'Interested in your AI services.');

    await page.click('button[type="submit"]');

    // Simulation takes ~1500ms
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Thank you for your inquiry')).toBeVisible();
  });

  test('phone link is properly formatted', async ({ page }) => {
    await page.goto('/contact/');

    const phoneLink = page.locator('a[href^="tel:"]');
    await expect(phoneLink).toBeVisible();
    const href = await phoneLink.getAttribute('href');
    expect(href).toBe('tel:+18768904060');
  });
});

test.describe('Homepage', () => {
  test('homepage loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    expect(errors).toHaveLength(0);
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/');

    const navLinks = page.locator('header a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('newsletter form renders', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('text=Submit')).toBeVisible();
  });

  test('newsletter success state (simulation)', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[type="email"]', 'subscriber@example.com');
    await page.click('button[type="submit"]');

    // Simulation takes ~1000ms
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Successfully connected')).toBeVisible();
  });

  test('og:image meta tag is present', async ({ page }) => {
    await page.goto('/');

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /og-default\.png/);
  });
});

test.describe('About Page', () => {
  test('about page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/about/');
    expect(errors).toHaveLength(0);
  });

  test('team section is visible', async ({ page }) => {
    await page.goto('/about/');

    await expect(page.locator('text=Hal').first()).toBeVisible();
  });
});

test.describe('Footer', () => {
  test('LinkedIn link points to correct company page', async ({ page }) => {
    await page.goto('/');

    const linkedinLink = page.locator('footer a[aria-label="LinkedIn"]');
    await expect(linkedinLink).toBeVisible();
    const href = await linkedinLink.getAttribute('href');
    expect(href).toBe('https://www.linkedin.com/company/paradigmitjm/');
  });
});

test.describe('SEO & Meta', () => {
  test('sitemap is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap-index.xml');
    expect(response?.status()).toBe(200);
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain('Sitemap:');
  });

  test('each page has unique meta description', async ({ page }) => {
    const pages = ['/', '/about/', '/contact/', '/services/', '/insights/'];
    const descriptions = new Set<string>();

    for (const path of pages) {
      await page.goto(path);
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc).toBeTruthy();
      descriptions.add(desc!);
    }

    // All descriptions should be unique
    expect(descriptions.size).toBe(pages.length);
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});
