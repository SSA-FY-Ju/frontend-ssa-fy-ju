import { NextRequest } from 'next/server';

/**
 * 백엔드로 전달할 Authorization 값을 accessToken 쿠키에서 구성한다.
 * 클라이언트(axios)는 이 헤더를 더 이상 직접 보내지 않으므로 쿠키만 본다.
 */
export function resolveAuthorization(req: NextRequest): string {
  const cookieToken = req.cookies.get('accessToken')?.value;
  return cookieToken ? `Bearer ${cookieToken}` : '';
}
