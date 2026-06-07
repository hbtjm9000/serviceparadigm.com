#!/usr/bin/env ts-node
/**
 * AGY Auto-Review — code quality scoring for the Ralph Wiggum / GrepLoop CI gate.
 * Scores the codebase 1–5 based on lint output, TODO density, type-check issues.
 * Output format: "Score: N/5" on stdout (parsed by delivery.yml).
 * Full output on stderr for issue body creation.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { globSync } from 'glob';

interface ReviewResult {
  score: number;
  deductions: string[];
  details: string[];
}

function sh(cmd: string, quiet = false): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 60000 });
    return { stdout: stdout.trim(), stderr: '', exitCode: 0 };
  } catch (e: any) {
    return {
      stdout: e.stdout?.trim() || '',
      stderr: e.stderr?.trim() || e.message,
      exitCode: e.status ?? 1,
    };
  }
}

function countTodoComments(): number {
  const files = globSync('src/**/*.{ts,tsx,astro,vue}', { ignore: 'node_modules/**' });
  let count = 0;
  for (const f of files) {
    const content = readFileSync(f, 'utf-8');
    const matches = content.match(/(TODO|FIXME|HACK|XXX|BUG|WORKAROUND)\b/gi);
    count += matches?.length ?? 0;
  }
  return count;
}

function countUnusedExports(): number {
  // Simple heuristic: grep for `export` then check if re-exported via index.ts
  const r = sh("grep -rn '^export ' src/ --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l");
  return parseInt(r.stdout) || 0;
}

async function main(): Promise<void> {
  const result: ReviewResult = { score: 5, deductions: [], details: [] };

  // 1. Run type check
  const tc = sh('bun run typecheck:ci 2>&1', true);
  const tcLines = tc.stderr.split('\n').filter(l => l.includes('error TS'));
  if (tc.exitCode !== 0) {
    const deduction = Math.min(2, Math.ceil(tcLines.length / 5));
    result.score -= deduction;
    result.deductions.push(`TypeScript errors: ${tcLines.length} found (−${deduction})`);
    result.details.push('--- TypeScript errors ---');
    tcLines.slice(0, 15).forEach(l => result.details.push(l));
    if (tcLines.length > 15) result.details.push(`... and ${tcLines.length - 15} more`);
  } else {
    result.details.push('TypeScript: clean');
  }

  // 2. Run lint
  const lint = sh('bun run lint 2>&1', true);
  const lintIssues = lint.stderr.split('\n').filter(l => l.includes('error') || l.includes('warning'));
  if (lint.exitCode !== 0) {
    const deduction = Math.min(1, Math.ceil(lintIssues.length / 10));
    result.score -= deduction;
    result.deductions.push(`Lint issues: ${lintIssues.length} found (−${deduction})`);
    result.details.push('--- Lint output ---');
    lintIssues.slice(0, 10).forEach(l => result.details.push(l));
  } else {
    result.details.push('Lint: clean');
  }

  // 3. Check TODO/FIXME density
  const todoCount = countTodoComments();
  if (todoCount > 5) {
    const deduction = Math.min(1, Math.floor((todoCount - 5) / 10) + 1);
    result.score -= deduction;
    result.deductions.push(`${todoCount} TODO/FIXME/HACK comments found (−${deduction})`);
  }
  result.details.push(`TODO/FIXME/HACK comments: ${todoCount}`);

  // 4. Check for dead code (files in git tracked but no imports from other files)
  const orphaned = sh(`find src -name '*.ts' -o -name '*.tsx' | while read f; do
    base=$(basename "$f" .ts)
    base=$(basename "$base" .tsx)
    deps=$(grep -rl "$base" src/ --include='*.ts' --include='*.tsx' --include='*.vue' --include='*.astro' 2>/dev/null | grep -v "$f" | wc -l)
    if [ "$deps" -eq 0 ] && ! echo "$f" | grep -qE '(index|main|entry|config|types?)\\.'; then
      echo "$f"
    fi
  done | head -5`, true);

  // 5. Build check
  const build = sh('bun run build 2>&1', true);
  if (build.exitCode !== 0) {
    result.score = Math.max(1, result.score - 1);
    result.deductions.push('Build failed (−1)');
    result.details.push('--- Build errors ---');
    build.stderr.split('\n').slice(0, 10).forEach(l => result.details.push(l));
  } else {
    result.details.push('Build: OK');
  }

  // Clamp score
  result.score = Math.max(1, Math.min(5, result.score));

  // Output
  console.log(`Score: ${result.score}/5`);
  console.log('');
  if (result.deductions.length > 0) {
    console.log('Deductions:');
    result.deductions.forEach(d => console.log(`  - ${d}`));
    console.log('');
  }
  if (result.details.length > 0) {
    console.log('Details:');
    result.details.forEach(d => console.log(`  ${d}`));
  }
}

main().catch(e => {
  console.error('AGY review failed:', e.message);
  console.log('Score: 1/5');
  console.log('');
  console.log(`Review crashed: ${e.message}`);
  process.exit(1);
});
