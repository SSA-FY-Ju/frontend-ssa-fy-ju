import { NextRequest, NextResponse } from 'next/server';
import { bypassHeaders } from '@/lib/server/bypass-header';
import { resolveAuthorization } from '@/lib/server/resolve-authorization';

const BACKEND_URL = process.env.BACKEND_URL!;

/** 로그아웃 — 실제 백엔드 프록시 (refreshToken 쿠키 전달 + 쿠키 삭제 응답 전달) */
export async function POST(req: NextRequest) {
  try {
    const authorization = resolveAuthorization(req);
    const cookieHeader = req.headers.get('cookie') ?? '';

    // 백엔드 명세에 맞춰 refreshToken 추출 및 헤더 추가
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken=') || c.startsWith('refresh_token='));
    const refreshToken = refreshTokenCookie?.split('=')[1];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...bypassHeaders,
      ...(authorization ? { Authorization: authorization } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };

    if (refreshToken) {
      headers['Refresh-Token'] = refreshToken;
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers,
    });

    const data = await res.json().catch(() => ({}));

    // 로그아웃은 "세션 종료"가 목적이다. 백엔드가 refreshToken 쿠키 부재/만료로 401을
    // 반환하더라도 세션은 이미 끝난 상태이므로, 프론트 관점에선 성공으로 정규화한다.
    // (아래에서 프론트 쿠키를 항상 제거하므로 클라이언트 상태는 확실히 초기화된다.)
    // 이렇게 하지 않으면 client.ts의 401 인터셉터가 refresh를 시도하고 실패해
    // 로그아웃 직후 로그인 모달이 떠버리는 문제가 발생한다.
    const clientStatus = res.ok || res.status === 401 ? 200 : res.status;
    const nextResponse = NextResponse.json(
      res.ok ? data : { success: true },
      { status: clientStatus },
    );

    // [마이그레이션 1단계] accessToken 쿠키는 백엔드가 모르는 Next.js 레이어의
    // 자체 쿠키이므로, 백엔드 Set-Cookie 전달과 별개로 직접 만료시켜야 한다.
    nextResponse.headers.append('set-cookie', 'accessToken=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
    // refreshToken도 백엔드의 Set-Cookie 전달에만 의존하지 않고 여기서 직접 만료시킨다.
    // (백엔드가 만료 쿠키를 안 보내거나 Path/Domain이 안 맞으면 브라우저에 남아,
    //  미들웨어가 여전히 "로그인됨"으로 판단해 보호 라우트를 통과시켜버리는 문제가 있었음)
    nextResponse.headers.append('set-cookie', 'refreshToken=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');

    // 백엔드에서 온 모든 Set-Cookie 헤더를 브라우저로 전달
    // 특히 토큰 만료(Max-Age=0) 쿠키가 포함되어야 함
    const setCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);

    setCookies.forEach((cookie) => {
      // 보안상 SameSite=Lax 및 Path=/ 보장
      let processed = cookie;
      if (!cookie.toLowerCase().includes('path=')) {
        processed += '; Path=/';
      }
      nextResponse.headers.append('set-cookie', processed);
    });

    return nextResponse;
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
