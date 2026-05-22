'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * 라우트 접근 가드
 *
 * 검사 순서:
 * 1. 로그인 여부 → 비로그인이면 / 로 리다이렉트 + 토스트
 * 2. birthDate 여부 → 없으면 /chat 으로 리다이렉트 + 토스트
 *
 * @param required - 가드 활성화 여부 (기본값: true)
 */
export function useRouteGuard(required: boolean = true) {
  const { birthDate, _hasHydrated } = useSessionStore();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const authHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!required) return;
    if (!_hasHydrated || !authHydrated || !isAuthReady) return; // 복원 + refresh 완료 후 판단
    if (pathname?.startsWith('/survey')) return;

    if (!isLoggedIn) {
      openLoginModal(); // 로그인 모달만 표시, 리다이렉트 없음
      return;
    }

    if (!birthDate) {
      toast.info('생년월일을 먼저 입력해주세요');
      router.push('/chat');
    }
  }, [required, _hasHydrated, authHydrated, isAuthReady, isLoggedIn, birthDate, pathname, router, openLoginModal]);
}
