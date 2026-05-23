'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * 로그인 상태 검증 가드
 *
 * 반환값:
 * - isAllowed: true면 로그인 확인 완료 → 페이지 렌더링 허용
 *              false면 검사 중이거나 리다이렉트 예정 → null 반환 권장
 *
 * @param required - 가드 활성화 여부 (기본값: true)
 */
export function useAuthGuard(required: boolean = true): { isAllowed: boolean } {
  const [isAllowed, setIsAllowed] = useState(false);
  // 'allowed'    → 허용 완료 (재검사 불필요)
  // 'redirected' → 미로그인으로 리다이렉트 완료 (중복 실행 방지, 단 isLoggedIn 변경 시 재평가)
  // null         → 아직 판정 전
  const settledRef = useRef<'allowed' | 'redirected' | null>(null);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 허용 완료 후에는 재실행하지 않음 (단, 로그인 상태가 유지되는 동안만)
    if (settledRef.current === 'allowed' && isLoggedIn) return;

    if (!required) {
      settledRef.current = 'allowed';
      setIsAllowed(true);
      return;
    }
    if (!_hasHydrated || !isAuthReady) return;

    // [핵심 수정] 인증 확인 프로세스 완료 후 실제 로그인 여부 엄격 체크
    if (!isLoggedIn) {
      if (pathname !== '/' && settledRef.current !== 'redirected') {
        settledRef.current = 'redirected';
        router.push('/');
        setTimeout(() => openLoginModal(), 100);
      }
      setIsAllowed(false);
      return;
    }

    // 로그인 상태 확인 완료 → 허용
    settledRef.current = 'allowed';
    setIsAllowed(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [required, _hasHydrated, isAuthReady, isLoggedIn, pathname, openLoginModal]);

  return { isAllowed };
}
