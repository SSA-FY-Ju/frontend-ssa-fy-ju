import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/** AI 커리어 상담 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const authorization = req.headers.get('authorization') ?? '';

  const res = await fetch(`${BACKEND_URL}/api/career/consultation`, {
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
