import { NextRequest, NextResponse } from 'next/server';
import { bypassHeaders } from '@/lib/server/bypass-header';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 관운 분석 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authorization = req.headers.get('authorization') ?? '';
    const cookie = req.headers.get('cookie') ?? '';

    const res = await fetch(`${BACKEND_URL}/api/career/timing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...bypassHeaders,
        ...(authorization ? { Authorization: authorization } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
