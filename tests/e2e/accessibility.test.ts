import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  const pages = [
    { url: '/', name: 'Home' },
    { url: '/about/', name: 'About' },
    { url: '/services/', name: 'Services' },
    { url: '/contact/', name: 'Contact' },
    { url: '/insights/', name: 'Insights' },
  ];

  for (const page of pages) {
    test(`${page.name} page loads without console errors`, async ({ page: browserPage }) => {
      const errors: string[] = [];
      browserPage.on('pageerror', (err) => errors.push(err.message));
      
      await browserPage.goto(`http://localhost:4321${page.url}`);
      
      expect(errors).toHaveLength(0);
    });
  }

  test('forms have proper labels', async ({ page }) => {
    await page.goto('http://localhost:4321/contact/');
    
    const nameLabel = await page.locator('label[for="name"]').count();
    const emailLabel = await page.locator('label[for="email"]').count();
    
    expect(nameLabel).toBe(1);
    expect(emailLabel).toBe(1);
  });

  test('newsletter form has label', async ({ page }) => {
    await page.goto('http://localhost:4321/');
    
    const label = await page.locator('label[for="newsletter-email"]').count();
    expect(label).toBe(1);
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('http://localhost:4321/');
    
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('external links have rel="noopener"', async ({ page }) => {
    await page.goto('http://localhost:4321/about/');
    
    const externalLinks = await page.locator('a[target="_blank"]').all();
    for (const link of externalLinks) {
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });
});