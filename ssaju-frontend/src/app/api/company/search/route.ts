import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';

const DART_API_KEY = process.env.DART_API_KEY;
const CORP_CODE_URL = `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${DART_API_KEY}`;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

export interface DartCompanyItem {
  corpName: string;
  corpCode: string;
  stockCode: string; // 상장사: 종목코드, 비상장: ''
}

// 서버 메모리 캐시 (Next.js 인스턴스 수명 내)
let corpCache: DartCompanyItem[] | null = null;
let corpCacheAt = 0;

async function getCorpList(): Promise<DartCompanyItem[]> {
  if (corpCache && Date.now() - corpCacheAt < CACHE_TTL) return corpCache;

  const res = await fetch(CORP_CODE_URL);
  if (!res.ok) throw new Error('DART corpCode 다운로드 실패');

  const buf = Buffer.from(await res.arrayBuffer());
  const zip = new AdmZip(buf);
  const xml = zip.readAsText('CORPCODE.xml');

  // <list>…</list> 블록 파싱
  const blocks = xml.match(/<list>[\s\S]*?<\/list>/g) ?? [];
  const list: DartCompanyItem[] = blocks.map((block) => {
    const get = (tag: string) => block.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`))?.[1]?.trim() ?? '';
    return {
      corpName: get('corp_name'),
      corpCode: get('corp_code'),
      stockCode: get('stock_code'),
    };
  }).filter((c) => c.corpName && c.corpCode);

  corpCache = list;
  corpCacheAt = Date.now();
  return list;
}

/** 기업명 검색 — DART corpCode.xml 기반 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 1) return NextResponse.json({ list: [] });

  if (!DART_API_KEY) {
    return NextResponse.json({ error: 'DART_API_KEY not configured' }, { status: 500 });
  }

  try {
    const all = await getCorpList();
    const lower = q.toLowerCase();

    // 우선순위: 앞글자 일치 > 포함 일치
    const startsWith = all.filter((c) => c.corpName.toLowerCase().startsWith(lower));
    const contains = all.filter(
      (c) => !c.corpName.toLowerCase().startsWith(lower) && c.corpName.toLowerCase().includes(lower)
    );

    const result = [...startsWith, ...contains].slice(0, 10);
    return NextResponse.json({ list: result });
  } catch (e) {
    console.error('[DART search]', e);
    return NextResponse.json({ list: [] }, { status: 500 });
  }
}
