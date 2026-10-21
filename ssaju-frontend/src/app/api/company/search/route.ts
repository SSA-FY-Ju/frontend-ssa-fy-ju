import { NextRequest, NextResponse } from 'next/server';
import { CompanySearchError, searchCorpNames } from '@/lib/server/company-search';

/** 기업명 검색 — 금융위원회 기업기본정보 API 프록시 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ list: [] });

  if (!process.env.FSC_API_KEY) {
    return NextResponse.json({ error: 'FSC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const list = await searchCorpNames(q);
    return NextResponse.json({ list });
  } catch (e) {
    // 화면이 "결과 없음"과 "불러오지 못함"을 구분해 안내할 수 있도록 오류를 빈 목록으로 감추지 않는다
    const code = e instanceof CompanySearchError ? e.code : 'UPSTREAM_ERROR';
    const status = code === 'TIMEOUT' ? 504 : code === 'UNAVAILABLE' ? 503 : 502;
    return NextResponse.json({ list: [], error: code }, { status });
  }
}
