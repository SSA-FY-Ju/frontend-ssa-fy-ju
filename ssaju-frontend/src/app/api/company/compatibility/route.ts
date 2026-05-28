import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 기업 궁합 분석 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authorization = req.headers.get('authorization') ?? '';

    const res = await fetch(`${BACKEND_URL}/api/company/compatibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
