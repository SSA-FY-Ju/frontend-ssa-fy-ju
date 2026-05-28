import { NextRequest, NextResponse } from 'next/server';
import { bypassHeaders } from '@/lib/server/bypass-header';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 분석 결과 상세 조회 — 실제 백엔드 프록시 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const authorization = req.headers.get('authorization') ?? '';
    const cookie = req.headers.get('cookie') ?? '';

    const query = searchParams.toString();
    const res = await fetch(
      `${BACKEND_URL}/api/mypage/analyses/${params.id}${query ? `?${query}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...bypassHeaders,
          ...(authorization ? { Authorization: authorization } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
