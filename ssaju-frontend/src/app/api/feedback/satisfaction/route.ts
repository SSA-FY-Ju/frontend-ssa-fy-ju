import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://api.ssaju.net';

/** 피드백 제출 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const authorization = req.headers.get('authorization') ?? '';

  const res = await fetch(`${BACKEND_URL}/api/feedback/satisfaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
