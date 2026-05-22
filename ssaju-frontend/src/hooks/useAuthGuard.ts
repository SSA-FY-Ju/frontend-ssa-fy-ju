'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  // 한 번 통과(allowed)한 뒤에는 로그아웃 등으로 isLoggedIn이 바뀌어도 재검사하지 않음
  const settledRef = useRef(false);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (settledRef.current) return; // 이미 판정 완료
    if (!required) {
      settledRef.current = true;
      setIsAllowed(true);
      return;
    }
    if (!_hasHydrated || !isAuthReady) return;
    if (pathname === '/') {
      settledRef.current = true;
      setIsAllowed(true);
      return;
    }

    if (!isLoggedIn) {
      settledRef.current = true;
      openLoginModal();
      router.push('/'); // 모달 오픈과 동시에 랜딩으로 이동 (모달은 전역이라 유지됨)
      return; // isAllowed = false 유지
    }

    settledRef.current = true;
    setIsAllowed(true);
  }, [required, _hasHydrated, isAuthReady, isLoggedIn, pathname, openLoginModal]);

  return { isAllowed };
}
