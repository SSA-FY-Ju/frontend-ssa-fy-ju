import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 로그아웃 — 실제 백엔드 프록시 (refreshToken 쿠키 전달 + 쿠키 삭제 응답 전달) */
export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization') ?? '';
    const cookieHeader = req.headers.get('cookie') ?? '';

    // 백엔드 명세에 맞춰 refreshToken 추출 및 헤더 추가
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken=') || c.startsWith('refresh_token='));
    const refreshToken = refreshTokenCookie?.split('=')[1];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };

    if (refreshToken) {
      headers['Refresh-Token'] = refreshToken;
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers,
    });

    const data = await res.json().catch(() => ({}));
    const nextResponse = NextResponse.json(data, { status: res.status });

    // 백엔드에서 온 모든 Set-Cookie 헤더를 브라우저로 전달
    // 특히 토큰 만료(Max-Age=0) 쿠키가 포함되어야 함
    const setCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);

    setCookies.forEach((cookie) => {
      // 보안상 SameSite=Lax 및 Path=/ 보장
      let processed = cookie;
      if (!cookie.toLowerCase().includes('path=')) {
        processed += '; Path=/';
      }
      nextResponse.headers.append('set-cookie', processed);
    });

    return nextResponse;
  } catch (err) {
    console.error('[API Logout Proxy] Error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
