/**
 * DART 전체 기업 목록 다운로드 스크립트
 *
 * 사용법: npm run fetch-dart-corps
 * 결과: public/dart-corps.json 생성 (기업명/코드/종목코드)
 */

import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// .env.local에서 DART_API_KEY 읽기
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const [key, ...rest] = line.split('=');
      if (key?.trim() === 'DART_API_KEY') {
        return rest.join('=').trim();
      }
    }
  } catch {}
  return process.env.DART_API_KEY ?? '';
}

async function main() {
  const apiKey = loadEnv();
  if (!apiKey) {
    console.error('❌ DART_API_KEY가 .env.local에 없습니다.');
    process.exit(1);
  }

  console.log('📥 DART 기업 목록 다운로드 중...');
  const url = `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`DART API 오류: ${res.status}`);

  const buf = Buffer.from(await res.arrayBuffer());

  const AdmZip = require('adm-zip');
  const zip = new AdmZip(buf);
  const xml = zip.readAsText('CORPCODE.xml');

  console.log('🔍 XML 파싱 중...');
  const blocks = xml.match(/<list>[\s\S]*?<\/list>/g) ?? [];
  const list = blocks
    .map((block) => {
      const get = (tag) => block.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`))?.[1]?.trim() ?? '';
      return {
        n: get('corp_name'),   // name
        c: get('corp_code'),   // code
        s: get('stock_code'),  // stock code (상장사만 존재)
      };
    })
    .filter((c) => c.n && c.c);

  const outPath = path.join(__dirname, '../public/dart-corps.json');
  writeFileSync(outPath, JSON.stringify(list));

  const sizeMB = (Buffer.byteLength(JSON.stringify(list)) / 1024 / 1024).toFixed(1);
  console.log(`✅ ${list.length.toLocaleString()}개 기업 저장 완료 (${sizeMB}MB) → public/dart-corps.json`);
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
