import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware
 *
 * 인증 체크는 클라이언트(useAuthGuard / useRouteGuard)가 담당합니다.
 * - 비로그인 접근 시 리다이렉트 없이 페이지를 그대로 서빙
 * - 클라이언트 가드가 isAllowed=false일 때 null 반환 + 로그인 모달 표시
 * - URL이 바뀌지 않으므로 사용자는 현재 위치에서 모달만 보게 됩니다
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
