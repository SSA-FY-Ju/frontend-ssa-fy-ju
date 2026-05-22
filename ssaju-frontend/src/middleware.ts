import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — 보호 라우트 접근 제어
 *
 * Edge 런타임에서 페이지 렌더링 전에 실행됩니다.
 *
 * 검사 항목:
 * - refreshToken HttpOnly 쿠키 유무
 *   없으면 → / 로 리다이렉트 (로그인 모달은 클라이언트에서 처리)
 *
 * 한계:
 * - birthDate / selectedService 는 sessionStorage 기반이라 미들웨어에서 검사 불가
 *   → 클라이언트 훅(useRouteGuard)이 보조 처리
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
    // 로그인 모달 자동 오픈 신호 전달
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
