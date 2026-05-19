import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.ssaju.net';

/** 이메일 중복 확인 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/api/auth/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
