import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 로그아웃 — 실제 백엔드 프록시 (refreshToken 쿠키 전달 + 쿠키 삭제 응답 전달) */
export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization') ?? '';
    const cookieHeader = req.headers.get('cookie') ?? '';

    const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    const nextResponse = NextResponse.json(data, { status: res.status });

    // 백엔드가 refreshToken 쿠키를 삭제하는 Set-Cookie 헤더를 전달
    const setCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);

    setCookies.forEach((cookie) => {
      // 삭제 쿠키라도 속성 정리를 해주는 것이 안전
      const processed = cookie
        .replace(/Domain=[^;]+(; )?/gi, '')
        .replace(/Secure(; )?/gi, '');
      
      nextResponse.headers.append('set-cookie', processed);
    });

    return nextResponse;
  } catch (err) {
    console.error('[API Logout Proxy] Error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
