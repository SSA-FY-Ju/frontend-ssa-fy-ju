import { NextRequest, NextResponse } from 'next/server';

const DART_API_KEY = process.env.DART_API_KEY;
const DART_BASE = 'https://opendart.fss.or.kr/api';

/** DART 기업 상세 조회 프록시 — est_dt(설립일) 포함 */
export async function GET(req: NextRequest) {
  const corpCode = req.nextUrl.searchParams.get('corpCode')?.trim();
  if (!corpCode) {
    return NextResponse.json({ error: 'corpCode required' }, { status: 400 });
  }

  if (!DART_API_KEY) {
    return NextResponse.json({ error: 'DART_API_KEY not configured' }, { status: 500 });
  }

  try {
    const url = `${DART_BASE}/company.json?crtfc_key=${DART_API_KEY}&corp_code=${corpCode}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    if (data.status !== '000') {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // est_dt: YYYYMMDD → YYYY-MM-DD
    const estDt: string = data.est_dt ?? '';
    const foundingDate = estDt.length === 8
      ? `${estDt.slice(0, 4)}-${estDt.slice(4, 6)}-${estDt.slice(6, 8)}`
      : null;

    return NextResponse.json({
      corpName: data.corp_name as string,
      foundingDate,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch company detail' }, { status: 500 });
  }
}
