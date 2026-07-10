import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — 로그인 여부 가드 (마이그레이션 5단계)
 *
 * refreshToken(HttpOnly, 장기 유효) 쿠키의 존재 여부로 "확실히 비로그인"인
 * 요청만 걸러낸다. accessToken(단기 유효)이 아니라 refreshToken을 기준으로
 * 삼는 이유: accessToken은 페이지 이동 중에도 자연스럽게 만료될 수 있고,
 * 그 경우는 axios 401 인터셉터가 재발급으로 처리하므로 미들웨어가 막을
 * 이유가 없다.
 *
 * 생년월일(birthDate) 입력 여부 체크는 서버가 알 수 없는 클라이언트 상태
 * (sessionStore)에 있으므로 그대로 useRouteGuard가 담당한다.
 */
const PROTECTED_PATHS = [
  '/select',
  '/chat',
  '/career-timing',
  '/compatibility',
  '/compatibility/result',
  '/consultation',
  '/my-page',
];

export function middleware(req: NextRequest) {
  const hasSession = !!req.cookies.get('refreshToken')?.value;

  if (!hasSession) {
    const url = new URL('/', req.url);
    url.searchParams.set('login', '1');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...PROTECTED_PATHS, '/my-page/:path*'],
};
