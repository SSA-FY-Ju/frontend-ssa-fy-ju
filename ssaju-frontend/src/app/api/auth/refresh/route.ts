import { NextRequest, NextResponse } from 'next/server';

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

    // 2. 백엔드 명세에 맞춰 헤더 설정 (Refresh-Token: {token})
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (refreshToken) {
      headers['Refresh-Token'] = refreshToken;
      console.log('[refresh] Using Refresh-Token header as per spec');
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    console.log('[refresh] backend status:', res.status);

    // 3. 백엔드 응답 헤더에서 새 토큰들 추출
    const newAccessToken = res.headers.get('authorization') ?? res.headers.get('Authorization') ?? '';
    const newRefreshToken = res.headers.get('refresh-token') ?? res.headers.get('Refresh-Token') ?? '';
    
    const data = await res.json().catch(() => ({}));
    const nextResponse = NextResponse.json(data, { status: res.status });

    // 4. 새 AccessToken 브라우저로 전달
    if (newAccessToken) {
      nextResponse.headers.set('authorization', newAccessToken);
    }

    // 5. 새 RefreshToken을 HttpOnly 쿠키로 설정하여 브라우저로 전달
    if (newRefreshToken) {
      // 보안 속성 정제 및 경로 강제
      const cookieValue = `refreshToken=${newRefreshToken}; HttpOnly; Path=/; SameSite=Lax`;
      nextResponse.headers.append('set-cookie', cookieValue);
      console.log('[refresh] New refresh token set as cookie');
    }

    // 백엔드에서 추가로 내려준 Set-Cookie가 있다면 함께 전달 (중복 방지 로직 포함 권장)
    const otherSetCookies = typeof res.headers.getSetCookie === 'function' 
      ? res.headers.getSetCookie() 
      : [];
    
    otherSetCookies.forEach(cookie => {
      if (!cookie.startsWith('refreshToken=')) {
        nextResponse.headers.append('set-cookie', cookie);
      }
    });

    return nextResponse;
  } catch (err) {
    console.error('[API Refresh Proxy] Error:', err);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
