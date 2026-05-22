import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 로그인 — 실제 백엔드 프록시 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  const nextResponse = NextResponse.json(data, { status: res.status });

  // accessToken 헤더 전달
  const authHeader = res.headers.get('authorization') ?? res.headers.get('Authorization') ?? '';
  if (authHeader) {
    nextResponse.headers.set('authorization', authHeader);
  }

  // 백엔드 refreshToken 쿠키 전달
  const setCookies: string[] =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);
  setCookies.forEach((cookie) => {
    nextResponse.headers.append('set-cookie', cookie);
  });

  // 로그인 성공 시 Next.js가 직접 sessionValid 쿠키를 세팅
  // → 미들웨어가 이 쿠키를 읽어 인증 여부 판단 (포워딩 의존 없이 확실하게 동작)
  if (res.ok) {
    nextResponse.cookies.set('sessionValid', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30일
    });
  }

  return nextResponse;
}
