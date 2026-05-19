'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!required) return;
    if (!_hasHydrated) return;
    if (pathname?.startsWith('/survey')) return;

    if (!isLoggedIn) {
      openLoginModal();
      router.push('/');
      return;
    }

    if (!birthDate) {
      router.push('/chat');
    }
  }, [required, _hasHydrated, isLoggedIn, birthDate, pathname, router]);
}
