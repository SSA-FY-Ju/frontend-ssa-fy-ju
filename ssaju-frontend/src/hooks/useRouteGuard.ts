'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * 라우트 접근 가드
 *
 * 검사 순서:
 * 1. 로그인 여부 → 비로그인이면 로그인 모달 표시
 * 2. birthDate 여부 → 없으면 /chat 으로 리다이렉트 + 토스트
 *
 * 반환값:
 * - isAllowed: true면 모든 조건 통과 → 페이지 렌더링 허용
 *              false면 검사 중이거나 리다이렉트 예정 → null 반환 권장
 *
 * @param required - 가드 활성화 여부 (기본값: true)
 */
export function useRouteGuard(required: boolean = true): { isAllowed: boolean } {
  const [isAllowed, setIsAllowed] = useState(false);
  const redirectedRef = useRef(false);

  const { birthDate, _hasHydrated } = useSessionStore();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const authHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!required) {
      setIsAllowed(true);
      return;
    }
    if (!_hasHydrated || !authHydrated || !isAuthReady) return;
    if (pathname?.startsWith('/survey')) {
      setIsAllowed(true);
      return;
    }
    if (redirectedRef.current) return;

    if (!isLoggedIn) {
      redirectedRef.current = true;
      openLoginModal();
      return; // isAllowed = false 유지 → 페이지 렌더 안 함
    }

    if (!birthDate) {
      redirectedRef.current = true;
      toast.info('생년월일을 먼저 입력해주세요');
      router.push('/chat?fromGuard=1');
      return; // isAllowed = false 유지
    }

    setIsAllowed(true);
  }, [required, _hasHydrated, authHydrated, isAuthReady, isLoggedIn, birthDate, pathname, router, openLoginModal]);

  return { isAllowed };
}
