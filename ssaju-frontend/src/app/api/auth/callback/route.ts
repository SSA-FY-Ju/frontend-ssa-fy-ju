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
    const redirectResponse = NextResponse.redirect(new URL('/', request.url));

    // 1. 백엔드 명세: Refresh-Token 헤더를 읽어 쿠키로 설정
    const backendRefreshToken = response.headers.get('refresh-token') ?? response.headers.get('Refresh-Token') ?? '';
    if (backendRefreshToken) {
      const cookieValue = `refreshToken=${backendRefreshToken}; HttpOnly; Path=/; SameSite=Lax`;
      redirectResponse.headers.append('set-cookie', cookieValue);
    }

    // 2. 백엔드가 설정하는 다른 쿠키들도 전달
    const setCookies = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : (response.headers.get('set-cookie') ? [response.headers.get('set-cookie')!] : []);

    setCookies.forEach((cookie) => {
      if (cookie.startsWith('refreshToken=')) return; // 중복 방지

      let processed = cookie
        .replace(/Domain=[^;]+(; )?/gi, '')
        .replace(/Secure(; )?/gi, '')
        .replace(/Path=[^;]+/gi, 'Path=/');

      if (processed.includes('SameSite=None')) {
        processed = processed.replace('SameSite=None', 'SameSite=Lax');
      }
      if (processed.endsWith(';')) processed = processed.slice(0, -1);
      redirectResponse.headers.append('set-cookie', processed);
    });

    return redirectResponse;
  } catch {
    return NextResponse.redirect(new URL('/?login_error=server_error', request.url));
  }
}
