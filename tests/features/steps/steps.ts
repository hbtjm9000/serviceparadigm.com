/**
 * BDD Step Definitions for serviceparadigm.com
 * Cucumber-js + Playwright integration
 *
 * Pre-requisite: `bun run preview --port 4321` running in background
 * Run: `bunx cucumber-js tests/features/ --require tests/features/steps/*.ts`
 */

import { Given, When, Then, Before, BeforeAll, After, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';

// Increase default step timeout from 5s to 20s for CI resource contention
setDefaultTimeout(20 * 1000);
import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import assert from 'assert';

let browser: Browser;
let context: BrowserContext;
let page: Page;

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

// Mock Google Apps Script endpoints for CI (avoids CORS/external dependency issues)
async function mockGoogleScriptEndpoints(page: any) {
  await page.route('**/script.google.com/**', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK' }),
    });
  });
}

// Core pages list
const PUBLIC_PAGES = [
  '/', '/about/', '/services/', '/contact/', '/privacy/',
  '/terms/', '/accessibility/', '/elements/', '/insights/',
  '/landings/element/', '/landings/packaged-ai/',
];

// Force experiment variant for deterministic tests
Before(async function () {
  // No-op per-scenario — experiment variant is set via page.addInitScript
});

// Clean up per-scenario: close page + context to avoid accumulation
After(async function () {
  if (page) await page.close().catch(() => {});
  if (context) await context.close().catch(() => {});
});

BeforeAll({ timeout: 30 * 1000 }, async function () {
  browser = await chromium.launch({ headless: true });
});

AfterAll({ timeout: 30 * 1000 }, async function () {
  if (browser) await browser.close().catch(() => {});
});

Given('I am on the homepage', async function () {
  context = await browser.newContext({ baseURL: BASE_URL });
  page = await context.newPage();
  // Force hero A/B test variant for deterministic tests
  await page.addInitScript(() => {
    localStorage.setItem('exp:hero-copy-test', 'v1-baseline');
  });
  await mockGoogleScriptEndpoints(page);
  await page.goto('/');
});

Given('I am on the contact page', async function () {
  context = await browser.newContext({ baseURL: BASE_URL });
  page = await context.newPage();
  await mockGoogleScriptEndpoints(page);
  await page.goto('/contact/');
});

Given('I browse the site', async function () {
  context = await browser.newContext({ baseURL: BASE_URL });
  page = await context.newPage();
  await mockGoogleScriptEndpoints(page);
});

// Generic step helpers

Then('the page should load with status {int}', async function (status: number) {
  const response = await page.goto(page.url());
  assert.equal(response?.status(), status);
});

Then('the page title should contain {string}', async function (text: string) {
  const title = await page.title();
  assert.ok(title.includes(text), `Expected title to contain "${text}", got "${title}"`);
});

Then('the body should not be empty', async function () {
  const bodyText = await page.locator('body').innerText();
  assert.ok(bodyText.length > 0, 'Body should not be empty');
});

Then('I should see the hero section heading {string}', async function (text: string) {
  const hero = page.locator('[class*="hero"]');
  const heroText = (await hero.textContent()) || '';
  assert.ok(heroText.includes(text), `Expected hero to contain "${text}"`);
});

Then('I should see a {string} call-to-action button', async function (text: string) {
  const button = page.locator('a, button').filter({ hasText: text });
  await button.waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see the main navigation bar', async function () {
  const nav = page.locator('header nav, header[role="navigation"], nav');
  await nav.waitFor({ state: 'visible', timeout: 5000 });
});

Then('the navigation should contain links to {string}', async function (linkList: string) {
  const expectedLinks = linkList.split(',').map((s: string) => s.trim());
  const navLinks = page.locator('header a, nav a');
  const count = await navLinks.count();
  const actualTexts: string[] = [];
  for (let i = 0; i < count; i++) {
    actualTexts.push((await navLinks.nth(i).innerText()).toLowerCase());
  }
  for (const link of expectedLinks) {
    assert.ok(
      actualTexts.some((t) => t.includes(link.toLowerCase())),
      `Navigation should contain "${link}"`
    );
  }
});

When('I scroll to the {string} section', async function (sectionTitle: string) {
  const heading = page.locator(`h2`, { hasText: sectionTitle });
  await heading.scrollIntoViewIfNeeded();
  await heading.waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see the heading {string}', async function (text: string) {
  const heading = page.locator(`h2`, { hasText: text });
  await heading.waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see cards for AI Strategy, Solutions Architecture, and Cybersecurity Architecture', async function () {
  const cards = page.locator('h3');
  const count = await cards.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    texts.push((await cards.nth(i).innerText()).toLowerCase());
  }
  assert.ok(texts.some(t => t.includes('ai strategy')), 'Should have AI Strategy card');
  assert.ok(texts.some(t => t.includes('solutions architecture')), 'Should have Solutions Architecture card');
  assert.ok(texts.some(t => t.includes('cybersecurity architecture')), 'Should have Cybersecurity Architecture card');
});

Then('I should see statistics for cost per minute and digital transformation failure rate', async function () {
  const bodyText = await page.locator('body').textContent() || '';
  assert.ok(bodyText.includes('Cost Per Minute'), 'Should show cost per minute stat');
  assert.ok(bodyText.includes('Digital Transformations'), 'Should show DX failure rate stat');
});

Then('I should see a newsletter email input field', async function () {
  const input = page.locator('input[type="email"]');
  await input.waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see a submit button for the newsletter', async function () {
  const btn = page.locator('button[type="submit"]');
  await btn.waitFor({ state: 'visible', timeout: 5000 });
});

// Footer links
Then('I should see a link to the {string} page', async function (pageName: string) {
  const link = page.locator(`footer a[href*="${pageName.toLowerCase()}"], a[href="/${pageName.toLowerCase()}/"]`);
  await link.waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see a link to the LinkedIn company page', async function () {
  const linkedin = page.locator('a[aria-label="LinkedIn"], a[href*="linkedin.com"]');
  await linkedin.waitFor({ state: 'visible', timeout: 5000 });
});

Then('the page should have an og:image meta tag', async function () {
  const og = page.locator('meta[property="og:image"]');
  const content = await og.getAttribute('content');
  assert.ok(content && content.length > 0, 'og:image should have content');
});

Then('each page should have an og:title meta tag', async function () {
  const og = page.locator('meta[property="og:title"]');
  const content = await og.getAttribute('content');
  assert.ok(content && content.length > 0, 'og:title should have content');
});

Then('the page should have a meta description', async function () {
  const desc = page.locator('meta[name="description"]');
  const content = await desc.getAttribute('content');
  assert.ok(content && content.length > 0, 'meta description should have content');
});

Then('every image on the page should have an alt attribute', async function () {
  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    assert.ok(alt != null, `Image ${i} should have alt attribute`);
  }
});

// Contact form specific
Then('I should see a field labeled {string}', async function (label: string) {
  const field = page.locator(`label[for="${label.toLowerCase()}"], input#${label.toLowerCase()}, textarea#${label.toLowerCase()}, select#${label.toLowerCase()}`).first();
  await field.waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see a submit button', async function () {
  const btn = page.locator('button[type="submit"]');
  await btn.waitFor({ state: 'visible', timeout: 5000 });
});

When('I fill in the contact form with valid data', async function () {
  await page.fill('#name', 'Jane Doe');
  await page.fill('#email', 'jane@example.com');
  await page.fill('#company', 'Acme Corp');
  await page.selectOption('#service', 'ai-strategy');
  await page.fill('#message', 'Interested in your AI services.');
});

When('I submit the form', async function () {
  await page.click('button[type="submit"]');
});

Then('I should see a success confirmation message', async function () {
  // Success div is inside the form element — scope to the contact form
  const form = page.locator('form').filter({ has: page.locator('#name') });
  const success = form.locator('text=/thank you for your|message.*received|successfully submitted|we.*ve received your/i');
  await success.first().waitFor({ state: 'visible', timeout: 10000 });
});

Then('I should see the email address {string} on the page', async function (email: string) {
  const emailText = page.locator(`text=${email}`);
  await emailText.waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see a phone link with a {string} href', async function (prefix: string) {
  const phoneLink = page.locator(`a[href^="${prefix}"]`);
  await phoneLink.waitFor({ state: 'visible', timeout: 5000 });
});

Then('I should see a physical address', async function () {
  // Check for address elements or location-related class names
  const addressEl = page.locator('address, [class*="address"], [class*="location"], [class*="contact-info"] p').first();
  const hasAddressElement = await addressEl.count() > 0;

  // Fallback: check page text for location keywords
  const bodyText = await page.locator('body').innerText();
  const hasLocationText = /Kingston|Jamaica|Street|Avenue|Suite|Drive|Boulevard|Road/i.test(bodyText);

  assert.ok(hasAddressElement || hasLocationText, 'Should show a physical address');
});

Then('every mailto link on the page should point to {string}', async function (email: string) {
  const mailtoLinks = await page.locator('a[href^="mailto:"]').all();
  for (const link of mailtoLinks) {
    const href = await link.getAttribute('href');
    assert.equal(href?.replace('mailto:', '').toLowerCase(), email.toLowerCase());
  }
});

// SEO and Standards specifics
When('I visit each public page', async function () {
  // No-op, handled per-scenario
});

When('I request {string}', async function (path: string) {
  await page.goto(path);
});

When('I visit the privacy page', async function () {
  await page.goto('/privacy/');
});

When('I visit the terms page', async function () {
  await page.goto('/terms/');
});

Then('I should receive HTTP {int}', async function (status: number) {
  const response = await page.goto(page.url());
  assert.equal(response?.status(), status);
});

Then('the content should contain {string}', async function (text: string) {
  const content = await page.content();
  assert.ok(content.includes(text), `Expected content to contain "${text}"`);
});

Then('every page should return HTTP 200', async function () {
  for (const path of PUBLIC_PAGES) {
    const response = await page.goto(path);
    assert.equal(response?.status(), 200, `${path} should return 200`);
  }
});

Then('every page should have a non-empty body', async function () {
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    const bodyText = await page.locator('body').innerText();
    assert.ok(bodyText.length > 0, `${path} body should not be empty`);
  }
});

Then('each page should have a meta description', async function () {
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    const desc = page.locator('meta[name="description"]');
    const content = await desc.getAttribute('content');
    assert.ok(content && content.length > 0, `${path} should have meta description`);
  }
});

Then('all meta descriptions should be unique', async function () {
  const descriptions = new Set<string>();
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    const content = await page.locator('meta[name="description"]').getAttribute('content');
    assert.ok(content, `${path} should have meta description`);
    descriptions.add(content);
  }
  assert.equal(descriptions.size, PUBLIC_PAGES.length, 'All meta descriptions should be unique');
});

Then('the page content should be longer than {int} characters', async function (minLen: number) {
  const bodyText = await page.locator('body').innerText();
  assert.ok(bodyText.length > minLen, `Content length ${bodyText.length} should exceed ${minLen}`);
});

Then('the page should mention {string}', async function (text: string) {
  const bodyText = await page.locator('body').innerText();
  assert.ok(bodyText.includes(text), `Body should mention "${text}"`);
});

Then('each page should have an og:image meta tag', async function () {
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    const og = page.locator('meta[property="og:image"]');
    const content = await og.getAttribute('content');
    assert.ok(content && content.length > 0, `${path} should have og:image`);
  }
});

Then('every external link targeting _blank should have rel="noopener"', async function () {
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    const externalLinks = await page.locator('a[target="_blank"]').all();
    for (const link of externalLinks) {
      const rel = await link.getAttribute('rel');
      assert.ok(rel?.includes('noopener'), `${path}: external link missing rel="noopener"`);
    }
  }
});
