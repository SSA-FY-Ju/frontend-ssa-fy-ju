import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.ssaju.net';

/** AI 커리어 상담 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/api/career/consultation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
