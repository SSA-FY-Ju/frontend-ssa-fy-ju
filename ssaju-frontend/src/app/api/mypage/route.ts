import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 마이페이지 조회 — 실제 백엔드 프록시 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authorization = req.headers.get('authorization') ?? '';
  const cookie = req.headers.get('cookie') ?? '';

  const query = searchParams.toString();
  const res = await fetch(`${BACKEND_URL}/api/mypage${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
