import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.ssaju.net';

/** 로그아웃 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization') ?? '';
  const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
