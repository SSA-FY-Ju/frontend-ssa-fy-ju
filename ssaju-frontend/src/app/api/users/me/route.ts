import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 회원 탈퇴 — 실제 백엔드 프록시 (쿠키 전달 + 쿠키 삭제 응답 전달) */
export async function DELETE(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization') ?? '';
    const cookieHeader = req.headers.get('cookie') ?? '';
    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    const nextResponse = NextResponse.json(data, { status: res.status });

    // 백엔드에서 온 Set-Cookie 헤더 전달 (refreshToken 쿠키 삭제 포함)
    const setCookies =
      typeof res.headers.getSetCookie === 'function'
        ? res.headers.getSetCookie()
        : res.headers.get('set-cookie')
          ? [res.headers.get('set-cookie')!]
          : [];

    setCookies.forEach((cookie) => {
      let processed = cookie;
      if (!cookie.toLowerCase().includes('path=')) {
        processed += '; Path=/';
      }
      nextResponse.headers.append('set-cookie', processed);
    });

    return nextResponse;
  } catch (err) {
    console.error('[API Users/Me DELETE Proxy] Error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
