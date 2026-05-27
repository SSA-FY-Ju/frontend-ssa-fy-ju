import { NextRequest, NextResponse } from 'next/server';

const FSC_API_KEY = process.env.FSC_API_KEY;
const FSC_BASE_URL =
  'https://apis.data.go.kr/1160100/service/GetCorpBasicInfoService_V2/getCorpOutline_V2';

// 서버 메모리 캐시 — Next.js 인스턴스 수명 내 유지 (기업명은 자주 안 바뀜)
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6시간
const serverCache = new Map<string, { list: { corpName: string }[]; at: number }>();

/** XML에서 특정 태그 값을 모두 추출 */
function extractXmlValues(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}>([^<]*)<\/${tag}>`, 'g');
  const results: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const val = match[1].trim();
    if (val) results.push(val);
  }
  return results;
}

/** 기업명 검색 — 금융위원회 기업기본정보 API 프록시 (XML 응답 파싱) */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 1) return NextResponse.json({ list: [] });

  if (!FSC_API_KEY) {
    return NextResponse.json({ error: 'FSC_API_KEY not configured' }, { status: 500 });
  }

  // 서버 캐시 확인
  const cacheKey = q.toLowerCase();
  const cached = serverCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return NextResponse.json({ list: cached.list });
  }

  try {
    const url = new URL(FSC_BASE_URL);
    url.searchParams.set('serviceKey', FSC_API_KEY);
    url.searchParams.set('corpNm', q);
    url.searchParams.set('numOfRows', '20');
    url.searchParams.set('pageNo', '1');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`FSC API HTTP error: ${res.status}`);

    const xml = await res.text();

    // 에러 응답 확인
    const resultCode = xml.match(/<resultCode>([^<]*)<\/resultCode>/)?.[1];
    if (resultCode && resultCode !== '00') {
      return NextResponse.json({ list: [] });
    }

    // corpNm 추출 — 중복 제거 후 최대 10건
    const names = extractXmlValues(xml, 'corpNm');
    const unique = [...new Set(names)].slice(0, 10);
    const list = unique.map((corpName) => ({ corpName }));

    // 서버 캐시 저장
    serverCache.set(cacheKey, { list, at: Date.now() });

    return NextResponse.json({ list });
  } catch {
    return NextResponse.json({ list: [] }, { status: 500 });
  }
}
