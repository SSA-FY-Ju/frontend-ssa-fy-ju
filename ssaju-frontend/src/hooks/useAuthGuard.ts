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
    // 허용 완료 후에는 재실행하지 않음
    if (settledRef.current === 'allowed') return;

    if (!required) {
      settledRef.current = 'allowed';
      setIsAllowed(true);
      return;
    }
    if (!_hasHydrated || !isAuthReady) return;
    if (pathname === '/') {
      settledRef.current = 'allowed';
      setIsAllowed(true);
      return;
    }

    if (!isLoggedIn) {
      // 확실하게 비로그인인 경우에만 처리 (isAuthReady=true인 상태에서 isLoggedIn=false)
      if (settledRef.current !== 'redirected') {
        settledRef.current = 'redirected';
        console.log('[useAuthGuard] User not logged in. Redirecting to landing.');
        openLoginModal();
        router.push('/');
      }
      return; // isAllowed = false 유지
    }

    // 로그인 상태 확인 완료 → 허용
    settledRef.current = 'allowed';
    setIsAllowed(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [required, _hasHydrated, isAuthReady, isLoggedIn, pathname, openLoginModal]);

  return { isAllowed };
}
