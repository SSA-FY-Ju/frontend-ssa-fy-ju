import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 로그아웃 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
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

  // 백엔드 Set-Cookie 전달 (refreshToken 삭제)
  const setCookies: string[] =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);
  setCookies.forEach((cookie) => {
    nextResponse.headers.append('set-cookie', cookie);
  });

  // sessionValid 쿠키 삭제
  nextResponse.cookies.delete('sessionValid');

  return nextResponse;
}
