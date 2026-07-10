import { NextRequest } from 'next/server';

/**
 * 백엔드로 전달할 Authorization 값을 구한다.
 *
 * accessToken 쿠키(마이그레이션 1단계에서 추가)를 우선 사용하고,
 * 쿠키가 없으면 클라이언트가 보낸 Authorization 헤더로 폴백한다.
 * 클라이언트가 헤더 전송을 중단하는 3단계 이후에는 쿠키만 쓰이게 된다.
 */
export function resolveAuthorization(req: NextRequest): string {
  const cookieToken = req.cookies.get('accessToken')?.value;
  if (cookieToken) return `Bearer ${cookieToken}`;
  return req.headers.get('authorization') ?? '';
}
