/**
 * OAuth 콜백 라우트 (Next.js App Router)
 *
 * 처리 흐름:
 * 1. authorization_code 수신
 * 2. 백엔드로 코드 전달 → 액세스 토큰 취득
 * 3. HttpOnly 쿠키 설정 (백엔드에서 처리)
 * 4. 홈 페이지로 리다이렉트
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // OAuth 에러 처리
  if (error) {
    return NextResponse.redirect(
      new URL(`/?login_error=${encodeURIComponent(error)}`, request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?login_error=no_code', request.url));
  }

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

    // 백엔드로 authorization code 전달
    // 백엔드가 HttpOnly 쿠키를 설정하고 응답함
    const response = await fetch(`${apiBaseUrl}/api/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/?login_error=auth_failed', request.url));
    }

    // 로그인 성공: 홈으로 리다이렉트
    // 팝업의 경우 부모 창에서 감지하여 처리
    const redirectResponse = NextResponse.redirect(new URL('/', request.url));

    // 백엔드가 Set-Cookie 헤더를 보냈다면 그대로 전달
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      redirectResponse.headers.set('Set-Cookie', setCookie);
    }

    return redirectResponse;
  } catch {
    return NextResponse.redirect(new URL('/?login_error=server_error', request.url));
  }
}
