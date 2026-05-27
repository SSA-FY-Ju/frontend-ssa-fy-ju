/**
 * 분석 결과 세션 캐싱 유틸
 *
 * 목적: 결과 페이지 새로고침 시 API 재호출 방지
 * 범위: sessionStorage (탭/브라우저 닫으면 자동 소멸)
 *
 * 새로고침 감지 원리:
 * - beforeunload 이벤트는 새로고침/브라우저 닫기 시만 발생
 * - Next.js router.push 등 SPA 네비게이션에서는 발생 안 함
 * → 플래그 있으면 새로고침 → 캐시 사용
 * → 플래그 없으면 일반 이동 → 캐시 삭제 후 새 분석
 */

const REFRESH_FLAG = 'ssaju_is_refresh';

// 모듈 로드 시 beforeunload 리스너 1회 등록 (클라이언트 한정)
// 새로고침된 경로를 함께 저장해, 다른 페이지에서 온 경우를 구분
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem(REFRESH_FLAG, window.location.pathname);
  });
}

/**
 * 현재 페이지가 새로고침되었는지 확인 후 플래그 제거 (1회성)
 *
 * 저장된 경로가 현재 경로와 일치할 때만 true 반환.
 * 다른 페이지에서 새로고침 후 이 페이지로 네비게이션한 경우 false.
 */
export function isPageRefresh(): boolean {
  if (typeof window === 'undefined') return false;
  const flaggedPath = sessionStorage.getItem(REFRESH_FLAG);
  sessionStorage.removeItem(REFRESH_FLAG);
  return flaggedPath === window.location.pathname;
}

const KEYS = {
  careerTiming: 'ssaju_result_ct',
  consultation: 'ssaju_result_cons',
  compatibility: 'ssaju_result_comp',
} as const;

type CacheKey = keyof typeof KEYS;

export const analysisCache = {
  get<T>(type: CacheKey): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(KEYS[type]);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(type: CacheKey, data: T): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(KEYS[type], JSON.stringify(data));
    } catch {}
  },

  remove(type: CacheKey): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(KEYS[type]);
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach((key) => sessionStorage.removeItem(key));
  },
};
