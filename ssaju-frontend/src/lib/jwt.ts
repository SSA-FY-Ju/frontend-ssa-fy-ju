/**
 * JWT 유틸리티
 * - 토큰 파싱은 검증(서명 확인) 없이 페이로드만 읽음
 * - 서버 검증은 API 호출 시 백엔드가 담당
 */

/** JWT payload의 exp 클레임 (Unix 초) 반환. 파싱 실패 시 null */
export function getJwtExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // URL-safe base64 → 표준 base64 변환 후 디코딩
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/**
 * 토큰이 만료됐는지 여부
 * @param marginSec 만료까지 남은 시간이 이 값(초) 이하면 만료로 간주
 */
export function isTokenExpired(token: string, marginSec = 0): boolean {
  const exp = getJwtExp(token);
  if (exp === null) return false; // JWT가 아닌 경우 낙관적으로 유효 처리
  return Date.now() / 1000 >= exp - marginSec;
}
