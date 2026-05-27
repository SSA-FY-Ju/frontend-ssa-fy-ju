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
  // 'allowed'        → 모든 조건 통과
  // 'login-redirect' → 미로그인 리다이렉트 완료 (isLoggedIn 변경 시 재평가 허용)
  // 'birth-redirect' → birthDate 없어 /chat 리다이렉트 완료
  // null             → 아직 판정 전
  const settledRef = useRef<'allowed' | 'login-redirect' | 'birth-redirect' | null>(null);

  const { birthDate, _hasHydrated } = useSessionStore();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const authHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!required) {
      settledRef.current = 'allowed';
      setIsAllowed(true);
      return;
    }

    if (!_hasHydrated || !authHydrated || !isAuthReady) {
      return;
    }

    // [핵심 수정] isAuthReady가 완료된 시점에서 실제 isLoggedIn 상태를 엄격하게 체크
    if (!isLoggedIn) {
      if (settledRef.current !== 'login-redirect') {
        settledRef.current = 'login-redirect';
        
        // 메인 페이지가 아니면 리다이렉트 및 로그인 모달 유도
        if (pathname !== '/') {
          router.push('/');
          setTimeout(() => openLoginModal(), 100);
        }
      }
      setIsAllowed(false);
      return;
    }

    if (!birthDate) {
      // birthDate 리다이렉트는 한 번만 실행
      if (settledRef.current !== 'birth-redirect') {
        settledRef.current = 'birth-redirect';
        toast.info('생년월일을 먼저 입력해주세요');
        router.push('/chat?fromGuard=1');
      }
      setIsAllowed(false);
      return;
    }

    settledRef.current = 'allowed';
    setIsAllowed(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [required, _hasHydrated, authHydrated, isAuthReady, isLoggedIn, birthDate, openLoginModal, pathname]);

  return { isAllowed };
}
