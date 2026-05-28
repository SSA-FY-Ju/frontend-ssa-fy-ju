/**
 * Vercel 배포 보호 우회 헤더
 *
 * VERCEL_BYPASS_TOKEN 환경변수가 설정된 경우 x-vercel-proxy 헤더를 반환합니다.
 * 백엔드 서버가 Vercel에 배포되어 있고 403 에러가 발생할 때 이 헤더를 추가하세요.
 */
export const bypassHeaders: Record<string, string> = process.env.VERCEL_BYPASS_TOKEN
  ? { 'x-vercel-proxy': process.env.VERCEL_BYPASS_TOKEN }
  : {};
