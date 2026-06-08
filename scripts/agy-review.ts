#!/usr/bin/env ts-node
/**
 * AGY Auto-Review — code quality scoring for the Ralph Wiggum / GrepLoop CI gate.
 * Integrates local checks (lint, typecheck, TODOs) with SonarQube issues.
 * Scores 1-5 based on combined findings.
 * Output format: "Score: N/5" on stdout (parsed by delivery.yml).
 * Full report on stdout for issue body creation.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { globSync } from 'glob';

interface ReviewResult {
  score: number;
  deductions: string[];
  details: string[];
}

interface SonarQubeIssue {
  severity: string;
  type: string;
  message: string;
  component: string;
  line?: number;
}

interface SonarQubeMeasure {
  metric: string;
  value: string;
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

async function fetchSonarQubeIssues(): Promise<{
  issues: SonarQubeIssue[];
  measures: SonarQubeMeasure[];
  error?: string;
}> {
  const sonarHost = process.env.SONAR_HOST || 'http://sonar.paradigm.local';
  const sonarToken = process.env.SONAR_TOKEN || '';
  const projectKey = 'paradigm_serviceparadigm';
  const auth = sonarToken ? '-H "Authorization: Bearer ' + sonarToken + '"' : '';

  try {
    // Fetch issues — top 100 by severity
    const issuesCmd = `curl -sf ${auth} "${sonarHost}/api/issues/search?componentKeys=${projectKey}&ps=100&severities=BLOCKER,CRITICAL,MAJOR,MINOR" 2>/dev/null || echo '{"issues":[],"total":0}'`;
    const issuesResp = sh(issuesCmd, true);
    let issuesData: { issues?: SonarQubeIssue[]; total?: number } = { issues: [], total: 0 };
    try { issuesData = JSON.parse(issuesResp.stdout); } catch { }

    // Fetch measures
    const measuresCmd = `curl -sf ${auth} "${sonarHost}/api/measures/component?component=${projectKey}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density" 2>/dev/null || echo '{"component":{"measures":[]}}'`;
    const measuresResp = sh(measuresCmd, true);
    let measuresData: { component?: { measures?: SonarQubeMeasure[] } } = { component: { measures: [] } };
    try { measuresData = JSON.parse(measuresResp.stdout); } catch { }

    return {
      issues: issuesData.issues || [],
      measures: measuresData.component?.measures || [],
    };
  } catch (e: any) {
    return { issues: [], measures: [], error: `SonarQube fetch failed: ${e.message}` };
  }
}

async function main(): Promise<void> {
  const result: ReviewResult = { score: 5, deductions: [], details: [] };

  // ─── 1. Type check ───
  const tc = sh('bun run typecheck:ci 2>&1', true);
  const tcLines = tc.stderr.split('\n').filter(l => l.includes('error TS'));
  if (tc.exitCode !== 0) {
    const deduction = Math.min(2, Math.ceil(tcLines.length / 5));
    result.score -= deduction;
    result.deductions.push(`TypeScript errors: ${tcLines.length} found (-${deduction})`);
    result.details.push('--- TypeScript errors ---');
    tcLines.slice(0, 15).forEach(l => result.details.push(l));
    if (tcLines.length > 15) result.details.push(`... and ${tcLines.length - 15} more`);
  } else {
    result.details.push('TypeScript: clean');
  }

  // ─── 2. Lint ───
  const lint = sh('bun run lint 2>&1', true);
  const lintIssues = lint.stderr.split('\n').filter(l => l.includes('error') || l.includes('warning'));
  if (lint.exitCode !== 0) {
    const deduction = Math.min(1, Math.ceil(lintIssues.length / 10));
    result.score -= deduction;
    result.deductions.push(`Lint issues: ${lintIssues.length} found (-${deduction})`);
    result.details.push('--- Lint output ---');
    lintIssues.slice(0, 10).forEach(l => result.details.push(l));
  } else {
    result.details.push('Lint: clean');
  }

  // ─── 3. TODO/FIXME density ───
  const todoCount = countTodoComments();
  if (todoCount > 5) {
    const deduction = Math.min(1, Math.floor((todoCount - 5) / 10) + 1);
    result.score -= deduction;
    result.deductions.push(`${todoCount} TODO/FIXME/HACK comments found (-${deduction})`);
  }
  result.details.push(`TODO/FIXME/HACK comments: ${todoCount}`);

  // ─── 4. Build check ───
  const build = sh('bun run build 2>&1', true);
  if (build.exitCode !== 0) {
    result.score = Math.max(1, result.score - 1);
    result.deductions.push('Build failed (-1)');
    result.details.push('--- Build errors ---');
    build.stderr.split('\n').slice(0, 10).forEach(l => result.details.push(l));
  } else {
    result.details.push('Build: OK');
  }

  // ─── 5. SonarQube integration ───
  const sq = await fetchSonarQubeIssues();
  if (sq.error) {
    result.details.push(`SonarQube: ${sq.error}`);
  } else {
    result.details.push(`SonarQube issues: ${sq.issues.length} total`);

    // Severity-based deductions
    const blocker = sq.issues.filter(i => i.severity === 'BLOCKER');
    const critical = sq.issues.filter(i => i.severity === 'CRITICAL');
    const major = sq.issues.filter(i => i.severity === 'MAJOR');

    if (blocker.length > 0) {
      const d = Math.min(2, blocker.length * 0.5);
      result.score -= d;
      result.deductions.push(`SonarQube BLOCKER: ${blocker.length} (-${d})`);
      result.details.push('--- Blocker issues ---');
      blocker.slice(0, 5).forEach(i =>
        result.details.push(`  [${i.type}] ${i.message} (${i.component})`)
      );
    }
    if (critical.length > 0) {
      const d = Math.min(1, critical.length * 0.3);
      result.score -= d;
      result.deductions.push(`SonarQube CRITICAL: ${critical.length} (-${d.toFixed(1)})`);
      result.details.push('--- Critical issues ---');
      critical.slice(0, 5).forEach(i =>
        result.details.push(`  [${i.type}] ${i.message} (${i.component})`)
      );
    }
    if (major.length > 0) {
      const d = Math.min(1, major.length * 0.1);
      result.score -= d;
      result.deductions.push(`SonarQube MAJOR: ${major.length} (-${d.toFixed(1)})`);
      result.details.push(`  (${major.length} major issues)`);
    }

    // Measure-based deductions
    const getMeasure = (m: string): number => {
      const found = sq.measures.find(x => x.metric === m);
      return found ? parseFloat(found.value) : 0;
    };

    const coverage = getMeasure('coverage');
    if (coverage > 0 && coverage < 80) {
      const d = coverage < 60 ? 1 : 0.5;
      result.score -= d;
      result.deductions.push(`Coverage: ${coverage}% (-${d})`);
    }
    result.details.push(`Coverage: ${coverage > 0 ? coverage + '%' : 'N/A'}`);

    const duplications = getMeasure('duplicated_lines_density');
    if (duplications > 5) {
      const d = 0.2;
      result.score -= d;
      result.deductions.push(`Duplication: ${duplications.toFixed(1)}% (-${d})`);
    }
    result.details.push(`Duplication: ${duplications.toFixed(1)}%`);

    const bugs = getMeasure('bugs');
    const vulns = getMeasure('vulnerabilities');
    const smells = getMeasure('code_smells');
    result.details.push(`Bugs: ${bugs}, Vulnerabilities: ${vulns}, Code smells: ${smells}`);
  }

  // Clamp score
  result.score = Math.round(Math.max(1, Math.min(5, result.score)));

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
