import { NextRequest, NextResponse } from 'next/server';
import { bypassHeaders } from '@/lib/server/bypass-header';

const BACKEND_URL = process.env.BACKEND_URL!;

/**
 * AccessToken 재발급 — 실제 백엔드 프록시
 *
 * 브라우저 → Next.js → 백엔드 방향으로 Cookie 헤더를 전달하고,
 * 백엔드 → Next.js → 브라우저 방향으로 Set-Cookie(새 refreshToken)를 전달
 */
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? '';
    
    // 1. 브라우저 쿠키에서 refreshToken 추출
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken=') || c.startsWith('refresh_token='));
    const refreshToken = refreshTokenCookie?.split('=')[1];

    // 2. 백엔드로 헤더 설정
    //    신 방식: 백엔드가 refreshToken을 "쿠키"에서 읽으므로 Cookie 헤더를 그대로 전달해야 한다.
    //    (구 방식 호환) refreshToken이 있으면 Refresh-Token 헤더도 함께 실어 보낸다.
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...bypassHeaders,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };

    if (refreshToken) {
      headers['Refresh-Token'] = refreshToken;
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    // 3. 백엔드 응답 헤더에서 새 토큰들 추출
    const newAccessToken = res.headers.get('authorization') ?? res.headers.get('Authorization') ?? '';
    const newRefreshToken = res.headers.get('refresh-token') ?? res.headers.get('Refresh-Token') ?? '';
    
    const data = await res.json().catch(() => ({}));
    const nextResponse = NextResponse.json(data, { status: res.status });

    // 4. 새 AccessToken 브라우저로 전달
    if (newAccessToken) {
      nextResponse.headers.set('authorization', newAccessToken);

      // [마이그레이션 1단계] accessToken을 HttpOnly 쿠키로도 함께 내려준다.
      // 기존 헤더 방식은 그대로 유지 — 클라이언트 코드는 아직 안 바꿈.
      const accessToken = newAccessToken.startsWith('Bearer ') ? newAccessToken.slice(7) : newAccessToken;
      nextResponse.headers.append('set-cookie', `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=Lax`);
    }

    // 5. (구 방식 호환) 백엔드가 Refresh-Token 헤더로 새 토큰을 내려주면 쿠키로 변환
    if (newRefreshToken) {
      const cookieValue = `refreshToken=${newRefreshToken}; HttpOnly; Path=/; SameSite=Lax`;
      nextResponse.headers.append('set-cookie', cookieValue);
    }

    // 6. 백엔드 Set-Cookie 정제 후 전달
    //    신 방식: 백엔드가 새 refreshToken을 Set-Cookie로 내려준다. Domain/Secure 제거,
    //    SameSite=None→Lax 로 정제해 프론트 오리진(localhost)에 저장되도록 통과시킨다.
    const otherSetCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);

    otherSetCookies.forEach((cookie) => {
      // 구 방식 헤더로 이미 수동 설정한 경우에만 refreshToken 중복 방지 (신 방식에선 그대로 통과)
      if (newRefreshToken && cookie.startsWith('refreshToken=')) return;

      let processed = cookie
        .replace(/Domain=[^;]+(; )?/gi, '')
        .replace(/Secure(; )?/gi, '')
        .replace(/Path=[^;]+/gi, 'Path=/');

      if (processed.includes('SameSite=None')) {
        processed = processed.replace('SameSite=None', 'SameSite=Lax');
      }
      nextResponse.headers.append('set-cookie', processed);
    });

    return nextResponse;
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
