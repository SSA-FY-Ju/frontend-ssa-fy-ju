'use client';

import { useEffect, useRef } from 'react';
import { useSessionRehydration } from '@/hooks/useSessionRehydration';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/stores/authStore';
import { tryRefreshToken } from '@/lib/api/client';
import { useTokenExpiry } from '@/hooks/useTokenExpiry';

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

  // 2-a. 토큰 만료 자동 감지 (타이머 + 탭 전환)
  useTokenExpiry();

  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);
  const accessToken = useAuthStore((s) => s.accessToken);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setIsAuthReady = useAuthStore((s) => s.setIsAuthReady);

  const triedRef = useRef(false);

  // 2-b. 인증 토큰 복구 (Silent Refresh — 앱 부팅 시 1회)
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

  // Zustand localStorage 하이드레이션 전까지만 차단 (수 ms 수준)
  // isAuthReady(네트워크 요청)는 기다리지 않고 백그라운드에서 처리
  if (!_hasHydrated) {
    return null;
  }

  return (
    <>
      {children}
      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
