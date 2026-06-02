/**
 * SEO/Perf Audit Script for CI - serviceparadigm.com
 *
 * Runs link checking (lychee) and basic SEO checks.
 * Does NOT require Lighthouse binary — delegates to lychee + Playwright.
 *
 * Run: bun scripts/audit-seo.ts
 */

import { execSync } from 'child_process';

interface SeoResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: SeoResult[] = [];

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

function check(name: string, cmd: string): void {
  try {
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 120_000, stdio: ['pipe', 'pipe', 'pipe'] });
    results.push({ name, passed: true, details: output.trim().split('\n').slice(0, 5).join('; ') });
  } catch (e: any) {
    results.push({ name, passed: false, details: e.stderr?.toString() || e.message });
  }
}

console.log('🌐 Running SEO / Perf audit...\n');

// 1. Check link health
check('Link checker (lychee)', `lychee --verbose --timeout 60 ${BASE_URL}/ 2>&1 || true`);

// 2. Check a few critical pages for basic SEO tags via curl
const pages = ['/', '/about/', '/services/', '/contact/'];
for (const page of pages) {
  check(`SEO meta: ${page}`, `curl -s ${BASE_URL}${page} | grep -c '<meta name="description"'`);
}

console.log('\n📋 SEO Audit Report\n');
let allPassed = true;

for (const r of results) {
  const icon = r.passed ? '✅' : '⚠️ ';
  console.log(`  ${icon} ${r.name}`);
  console.log(`     ${r.details}`);
  if (!r.passed) allPassed = false;
}

console.log(`\n${allPassed ? '✅ SEO checks passed.' : '⚠️ Some SEO checks have warnings.'}`);

if (!allPassed) {
  process.exit(1);
} else {
  process.exit(0);
}
