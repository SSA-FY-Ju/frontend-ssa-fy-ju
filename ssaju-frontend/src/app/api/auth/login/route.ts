import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 로그인 — 실제 백엔드 프록시 (Authorization 헤더 + refreshToken Set-Cookie 전달) */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  const nextResponse = NextResponse.json(data, { status: res.status });

  // 백엔드가 응답 헤더로 내려주는 accessToken을 브라우저로 전달
  const authHeader = res.headers.get('authorization') ?? res.headers.get('Authorization') ?? '';
  if (authHeader) {
    nextResponse.headers.set('authorization', authHeader);
  }

  // 백엔드가 설정하는 refreshToken HttpOnly 쿠키를 브라우저로 전달
  const setCookies = res.headers.getSetCookie?.() ?? [];
  setCookies.forEach((cookie) => {
    nextResponse.headers.append('set-cookie', cookie);
  });

  return nextResponse;
}
