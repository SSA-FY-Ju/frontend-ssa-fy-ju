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

    // 2. (구 방식 호환) 백엔드가 Refresh-Token 헤더로 내려주면 쿠키로 변환.
    //    신 방식에서는 백엔드가 refreshToken을 Set-Cookie로 직접 내려주므로 이 헤더는 없다.
    const backendRefreshToken = res.headers.get('refresh-token') ?? res.headers.get('Refresh-Token') ?? '';
    if (backendRefreshToken) {
      const cookieValue = `refreshToken=${backendRefreshToken}; HttpOnly; Path=/; SameSite=Lax`;
      nextResponse.headers.append('set-cookie', cookieValue);
    }

    // 3. 백엔드 Set-Cookie 헤더 정제 후 전달
    //    신 방식: 백엔드가 refreshToken을 여기에 실어 보낸다. 프론트 오리진(localhost)에서
    //    저장되도록 Domain/Secure 제거, SameSite=None→Lax 로 정제해 통과시킨다.
    const setCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);

    setCookies.forEach((cookie) => {
      // 구 방식 헤더로 이미 refreshToken을 수동 설정한 경우에만 중복 방지 (신 방식에선 그대로 통과)
      if (backendRefreshToken && cookie.startsWith('refreshToken=')) return;

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

