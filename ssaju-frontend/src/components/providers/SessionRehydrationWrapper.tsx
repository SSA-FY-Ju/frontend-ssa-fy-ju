'use client';

import { useEffect, useRef } from 'react';
import { useSessionRehydration } from '@/hooks/useSessionRehydration';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/stores/authStore';
import { tryRefreshToken } from '@/lib/api/client';

/**
 * Session 복원 래퍼 컴포넌트
 *
 * 동작:
 * 1. 앱 부팅 시 sessionStorage 세션 데이터 복원 (useSessionRehydration)
 * 2. Zustand Hydration 대기 (_hasHydrated)
 * 3. 첫 mount 시 무조건 silent refresh 시도하여 세션 복구
 * 4. AuthModal 전역 렌더링
 */
export function SessionRehydrationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. 세션 데이터 복원 (sessionStorage)
  useSessionRehydration();

  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);
  const accessToken = useAuthStore((s) => s.accessToken);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const setIsAuthReady = useAuthStore((s) => s.setIsAuthReady);

  const triedRef = useRef(false);

  // 2. 인증 토큰 복구 (Silent Refresh)
  useEffect(() => {
    // Zustand Persist Hydration이 완료될 때까지 대기
    if (!_hasHydrated || triedRef.current) return;
    triedRef.current = true;

    // 이미 메모리에 토큰이 있으면(거의 없겠지만) 즉시 준비 완료
    if (accessToken) {
      setIsAuthReady(true);
      return;
    }

    // [핵심] 첫 마운트 시 무조건 refresh 시도하여 쿠키에 있는 세션 확인
    (async () => {
      try {
        // api/client.ts에 정의된 중앙 리프레시 로직 사용
        const success = await tryRefreshToken();
        
        if (!success) {
          useAuthStore.getState().setIsLoggedIn(false);
          useAuthStore.getState().setAccessToken(null);
          useAuthStore.getState().setUser(null);
        }
      } catch (err) {
        useAuthStore.getState().setIsLoggedIn(false);
      } finally {
        setIsAuthReady(true);
      }
    })();
  }, [_hasHydrated, accessToken, setIsAuthReady]);

  // Hydration 전에는 아무것도 렌더링하지 않음
  if (!_hasHydrated) {
    return null;
  }

  // 인증 확인 절차가 끝날 때까지 렌더링을 차단하여 가드 오동작 방지
  if (!isAuthReady) {
    return null; 
  }

  return (
    <>
      {children}
      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
