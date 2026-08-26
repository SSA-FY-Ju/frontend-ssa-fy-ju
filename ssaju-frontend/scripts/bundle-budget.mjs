#!/usr/bin/env node
/**
 * 번들 사이즈 예산 검사
 *
 * `next build` 가 출력하는 라우트 표를 그대로 파싱해 First Load JS 를 예산과 비교한다.
 * 자체 계산이 아니라 빌드 로그의 값을 쓰는 이유: 개선 전후로 인용할 숫자가
 * 팀원이 콘솔에서 보는 값과 항상 일치해야 한다.
 *
 * 사용법:
 *   npm run build > build.log 2>&1
 *   node scripts/bundle-budget.mjs --log build.log            예산 검사 (초과 시 exit 1)
 *   node scripts/bundle-budget.mjs --log build.log --update   현재 값을 새 예산으로 기록
 *   node scripts/bundle-budget.mjs --log build.log --markdown PR 코멘트용 표 출력
 *   cat build.log | node scripts/bundle-budget.mjs            stdin 입력도 가능
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUDGET_FILE = join(ROOT, 'bundle-budget.json');

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const logPath = argv[argv.indexOf('--log') + 1];

const isUpdate = flags.has('--update');
const isMarkdown = flags.has('--markdown');

/** 청크 해시 변동에 따른 미세한 흔들림을 흡수하는 여유분 (kB) */
const TOLERANCE_KB = 2;

function readInput() {
  if (flags.has('--log')) {
    if (!logPath || !existsSync(logPath)) {
      console.error(`✗ 빌드 로그를 찾을 수 없습니다: ${logPath ?? '(경로 없음)'}`);
      process.exit(1);
    }
    return readFileSync(logPath, 'utf8');
  }
  try {
    return readFileSync(0, 'utf8');
  } catch {
    console.error('✗ 입력이 없습니다. --log <파일> 로 빌드 로그를 지정하거나 stdin 으로 넘겨주세요.');
    process.exit(1);
  }
}

/**
 * Next.js 빌드 표에서 라우트별 First Load JS 를 추출한다.
 *
 * 대상 줄 예시:
 *   ├ ○ /career-timing        4.74 kB     144 kB
 *   ┌ ○ /                     3.86 kB     190 kB
 * 제외 대상:
 *   - API 라우트 (First Load JS 가 0 B)
 *   - "First Load JS shared by all" 요약 줄
 *   - 미들웨어 줄
 */
function parseBuildLog(text) {
  const routes = [];
  for (const rawLine of text.split(/\r?\n/)) {
    // 트리 문자로 시작하는 라우트 줄만 대상으로 한다
    const line = rawLine.replace(/\[[0-9;]*m/g, ''); // ANSI 색상 제거
    const match = line.match(
      /^[┌├└│\s]+[○●ƒλ]\s+(\S+)\s+([\d.]+)\s*(B|kB|MB)\s+([\d.]+)\s*(B|kB|MB)\s*$/,
    );
    if (!match) continue;

    const [, route, , , firstLoadValue, firstLoadUnit] = match;
    if (route.startsWith('/api/')) continue;

    const toKb = { B: 1 / 1024, kB: 1, MB: 1024 }[firstLoadUnit];
    const firstLoadKb = Math.round(Number(firstLoadValue) * toKb * 10) / 10;
    if (firstLoadKb === 0) continue;

    routes.push({ route, firstLoadKb });
  }
  return routes.sort((a, b) => b.firstLoadKb - a.firstLoadKb);
}

const routes = parseBuildLog(readInput());

if (routes.length === 0) {
  console.error('✗ 빌드 로그에서 라우트 표를 찾지 못했습니다. `next build` 출력 전체가 맞는지 확인하세요.');
  process.exit(1);
}

if (isUpdate) {
  const firstLoadJsKb = Object.fromEntries(routes.map((r) => [r.route, r.firstLoadKb]));
  writeFileSync(BUDGET_FILE, `${JSON.stringify({ firstLoadJsKb }, null, 2)}\n`);
  console.log(`✓ 예산을 현재 값으로 기록했습니다 → bundle-budget.json (${routes.length}개 라우트)`);
  process.exit(0);
}

if (!existsSync(BUDGET_FILE)) {
  console.error('✗ bundle-budget.json 이 없습니다. --update 로 먼저 생성하세요.');
  process.exit(1);
}

const { firstLoadJsKb: budget } = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));

const rows = routes.map((r) => {
  const budgetKb = budget[r.route];
  const hasBudget = typeof budgetKb === 'number';
  const deltaKb = hasBudget ? Math.round((r.firstLoadKb - budgetKb) * 10) / 10 : null;
  return { ...r, budgetKb, hasBudget, deltaKb, over: hasBudget && deltaKb > TOLERANCE_KB };
});

const violations = rows.filter((r) => r.over);
const improvements = rows.filter((r) => r.deltaKb !== null && r.deltaKb < -0.5);
const sign = (d) => (d > 0 ? `+${d}` : `${d}`);

if (isMarkdown) {
  console.log('### 📦 번들 사이즈 (First Load JS)\n');
  console.log('| 라우트 | 현재 | 기준 | 변화 |');
  console.log('|---|---:|---:|---:|');
  for (const r of rows) {
    const mark = r.over ? '🔴' : r.deltaKb !== null && r.deltaKb < -0.5 ? '🟢' : '';
    const delta = r.deltaKb === null ? '신규' : `${sign(r.deltaKb)} kB ${mark}`;
    console.log(
      `| \`${r.route}\` | ${r.firstLoadKb} kB | ${r.hasBudget ? `${r.budgetKb} kB` : '—'} | ${delta} |`,
    );
  }
  const total = rows.reduce((s, r) => s + (r.deltaKb ?? 0), 0);
  console.log(`\n합계 변화: **${sign(Math.round(total * 10) / 10)} kB**`);
  console.log(
    violations.length === 0
      ? '\n✅ 모든 라우트가 예산 이내입니다.'
      : `\n🔴 ${violations.length}개 라우트가 예산을 초과했습니다.`,
  );
} else {
  const pad = (s, n) => String(s).padEnd(n);
  const padS = (s, n) => String(s).padStart(n);
  console.log('\n번들 사이즈 예산 (First Load JS)\n');
  console.log(`  ${pad('라우트', 26)}${padS('현재', 10)}${padS('기준', 10)}${padS('변화', 11)}`);
  console.log(`  ${'-'.repeat(57)}`);
  for (const r of rows) {
    const delta = r.deltaKb === null ? '신규' : `${sign(r.deltaKb)} kB`;
    const mark = r.over ? '  ✗ 초과' : r.deltaKb !== null && r.deltaKb < -0.5 ? '  ✓ 감소' : '';
    console.log(
      `  ${pad(r.route, 26)}${padS(`${r.firstLoadKb} kB`, 10)}${padS(r.hasBudget ? `${r.budgetKb} kB` : '—', 10)}${padS(delta, 11)}${mark}`,
    );
  }
  if (improvements.length > 0) {
    console.log(`\n  ✓ ${improvements.length}개 라우트 감소`);
  }
  console.log('');
}

if (violations.length > 0) {
  console.error(
    `✗ 번들 예산 초과 ${violations.length}건: ${violations.map((v) => `${v.route}(${sign(v.deltaKb)}kB)`).join(', ')}`,
  );
  console.error('  의도한 증가라면 --update 로 예산을 갱신하세요.');
  process.exit(1);
}
