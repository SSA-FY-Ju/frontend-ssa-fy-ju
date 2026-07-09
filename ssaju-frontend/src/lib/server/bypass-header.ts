/**
 * Cloudflare 우회 헤더
 *
 * VERCEL_BYPASS_TOKEN 환경변수가 설정된 경우 x-vercel-proxy 헤더를 반환합니다.
 * api.ssaju.net 앞단 Cloudflare가 이 헤더/값을 검사해 봇 차단(WAF)을 우회시켜줍니다.
 * 로컬 개발에서 프록시 요청이 Cloudflare에 403으로 막힐 때 이 헤더가 필요합니다.
 */
export const bypassHeaders: Record<string, string> = process.env.VERCEL_BYPASS_TOKEN
  ? { 'x-vercel-proxy': process.env.VERCEL_BYPASS_TOKEN }
  : {};
