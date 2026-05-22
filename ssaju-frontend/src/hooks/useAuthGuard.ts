'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * 로그인 상태 검증 가드
 *
 * 반환값:
 * - isAllowed: true면 로그인 확인 완료 → 페이지 렌더링 허용
 *              false면 검사 중이거나 모달 표시 중 → null 반환 권장
 *
 * @param required - 가드 활성화 여부 (기본값: true)
 */
export function useAuthGuard(required: boolean = true): { isAllowed: boolean } {
  const [isAllowed, setIsAllowed] = useState(false);
  const modalOpenedRef = useRef(false);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const pathname = usePathname();

  useEffect(() => {
    if (!required) {
      setIsAllowed(true);
      return;
    }
    if (!_hasHydrated || !isAuthReady) return;
    if (pathname === '/') {
      setIsAllowed(true);
      return;
    }
    if (modalOpenedRef.current) return;

    if (!isLoggedIn) {
      modalOpenedRef.current = true;
      openLoginModal();
      return; // isAllowed = false 유지
    }

    setIsAllowed(true);
  }, [required, _hasHydrated, isAuthReady, isLoggedIn, pathname, openLoginModal]);

  return { isAllowed };
}
