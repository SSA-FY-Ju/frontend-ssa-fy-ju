import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — 보호 라우트 사전 접근 제어 (Edge Runtime)
 *
 * 페이지 JS 실행 전, 서버에서 요청을 가로채 인증을 검사합니다.
 * - refreshToken HttpOnly 쿠키 없음 → /?openModal=true 로 리다이렉트
 * - SessionRehydrationWrapper가 openModal 파라미터를 감지해 모달 즉시 오픈
 */

const PROTECTED_ROUTES = [
  '/select',
  '/chat',
  '/career-timing',
  '/consultation',
  '/compatibility',
  '/my-page',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtected) return NextResponse.next();

  const hasRefreshToken = req.cookies.has('refreshToken');
  if (!hasRefreshToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('openModal', 'true');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/select/:path*',
    '/chat/:path*',
    '/career-timing/:path*',
    '/consultation/:path*',
    '/compatibility/:path*',
    '/my-page/:path*',
  ],
};
