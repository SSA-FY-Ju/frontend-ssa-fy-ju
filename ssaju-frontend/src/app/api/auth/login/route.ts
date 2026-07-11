import { NextRequest, NextResponse } from 'next/server';
import { bypassHeaders } from '@/lib/server/bypass-header';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 로그인 — 실제 백엔드 프록시 (Authorization 헤더 + refreshToken Set-Cookie 전달) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...bypassHeaders },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    const nextResponse = NextResponse.json(data, { status: res.status });

    // 1. 백엔드가 응답 헤더로 내려주는 accessToken을 브라우저로 전달
    const authHeader = res.headers.get('authorization') ?? res.headers.get('Authorization') ?? '';
    if (authHeader) {
      nextResponse.headers.set('authorization', authHeader);

      // [마이그레이션 1단계] accessToken을 HttpOnly 쿠키로도 함께 내려준다.
      // 기존 헤더 방식은 그대로 유지 — 클라이언트 코드는 아직 안 바꿈.
      const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      nextResponse.headers.append('set-cookie', `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=Lax`);
    }

    // 2. 백엔드 명세: Refresh-Token 헤더를 읽어 쿠키로 설정
    const backendRefreshToken = res.headers.get('refresh-token') ?? res.headers.get('Refresh-Token') ?? '';
    if (backendRefreshToken) {
      const cookieValue = `refreshToken=${backendRefreshToken}; HttpOnly; Path=/; SameSite=Lax`;
      nextResponse.headers.append('set-cookie', cookieValue);
    }

    // 3. 기존 Set-Cookie 헤더들도 정제하여 전달
    const setCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);

    setCookies.forEach((cookie) => {
      if (cookie.startsWith('refreshToken=')) return; // 위에서 수동 설정한 것과 중복 방지
      
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

