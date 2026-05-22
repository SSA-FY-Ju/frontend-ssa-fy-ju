import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/**
 * AccessToken 재발급 — 실제 백엔드 프록시
 *
 * 브라우저 → Next.js → 백엔드 방향으로 Cookie 헤더를 전달하고,
 * 백엔드 → Next.js → 브라우저 방향으로 Set-Cookie(새 refreshToken)를 전달
 */
export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') ?? '';

  console.log('[refresh] incoming cookies:', cookieHeader ? cookieHeader.substring(0, 80) + '...' : '(없음)');

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  console.log('[refresh] backend status:', res.status);

  const authHeader = res.headers.get('authorization') ?? res.headers.get('Authorization') ?? '';
  console.log('[refresh] Authorization header:', authHeader ? '있음' : '없음');

  const data = await res.json();
  const nextResponse = NextResponse.json(data, { status: res.status });

  // 백엔드가 Authorization 헤더로 토큰을 내려줄 경우 브라우저로 전달
  if (authHeader) {
    nextResponse.headers.set('authorization', authHeader);
  }

  // 갱신된 refreshToken 쿠키를 브라우저로 전달
  // getSetCookie()가 없는 환경 대비 fallback 포함
  const setCookies: string[] =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);

  console.log('[refresh] set-cookie count:', setCookies.length);
  setCookies.forEach((cookie) => {
    nextResponse.headers.append('set-cookie', cookie);
  });

  return nextResponse;
}
