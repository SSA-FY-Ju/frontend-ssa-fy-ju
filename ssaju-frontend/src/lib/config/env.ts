/**
 * 환경 변수 설정
 *
 * NEXT_PUBLIC_API_BASE_URL:
 *   - 빈 문자열(기본값) → apiFetch가 상대 경로로 호출 → Next.js 프록시 → https://api.ssaju.net
 *   - http://localhost:8080  → 로컬 백엔드 직접 호출 (MSW로 가로채거나 로컬 서버 실행 시)
 */

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
};
