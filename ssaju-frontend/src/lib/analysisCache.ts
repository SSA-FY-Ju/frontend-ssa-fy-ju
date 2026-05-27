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
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem(REFRESH_FLAG, '1');
  });
}

/** 새로고침 여부 확인 후 플래그 제거 (1회성) */
export function isPageRefresh(): boolean {
  if (typeof window === 'undefined') return false;
  const flag = sessionStorage.getItem(REFRESH_FLAG) === '1';
  sessionStorage.removeItem(REFRESH_FLAG);
  return flag;
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
