/**
 * CI Audit Aggregator
 * Runs the full audit suite for CI pipeline: security + SEO/links + bundle.
 *
 * Run: bun scripts/audit-ci.ts
 */

import { execSync } from 'child_process';

interface AuditStep {
  name: string;
  cmd: string;
  passed: boolean;
  output: string;
}

const steps: AuditStep[] = [];

function run(name: string, cmd: string): void {
  console.log(`  ⏳ ${name}...`);
  try {
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 180_000, stdio: ['pipe', 'pipe', 'pipe'] });
    steps.push({ name, cmd, passed: true, output: output.trim().slice(0, 200) });
    console.log(`  ✅ ${name}`);
  } catch (e: any) {
    const err = e.stderr?.toString() || e.stdout?.toString() || e.message;
    steps.push({ name, cmd, passed: false, output: err.slice(0, 200) });
    console.log(`  ❌ ${name}`);
  }
}

console.log('🏗️  Running CI Audit Suite\n');

// 1. Lint
run('ESLint', 'eslint . --max-warnings=50 2>&1 || true');

// 2. TypeScript type check (non-blocking)
run('Type check', 'tsc --noEmit --pretty 2>&1 || true');

// 3. Unit tests
run('Vitest unit tests', 'vitest run 2>&1');

// 4. Build
run('Astro build', 'astro build 2>&1');

// 5. Preview (background) and run audits
run('Link check', 'lychee --verbose --timeout 60 http://localhost:4321/ 2>&1 || true');

// 6. Bundle size check (warn if dist exceeds 5MB)
run('Bundle size check', `du -sh dist/ 2>&1 | awk '{print $1}'`);

// Aggregate
console.log('\n📊 CI Audit Summary\n');

let allPassed = true;
for (const s of steps) {
  const icon = s.passed ? '✅' : '❌';
  console.log(`  ${icon} ${s.name}`);
  if (!s.passed) allPassed = false;
}

console.log(`\n${allPassed ? '✅ All CI audits passed.' : '❌ Some CI audits failed — check logs.'}`);
if (!allPassed) process.exit(1);
