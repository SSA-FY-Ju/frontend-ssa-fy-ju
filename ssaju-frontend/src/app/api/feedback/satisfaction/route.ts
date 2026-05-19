import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.ssaju.net';

/** 피드백 제출 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/api/feedback/satisfaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
