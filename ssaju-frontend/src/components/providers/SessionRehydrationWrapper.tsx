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
 * 2. 첫 mount 시 무조건 silent refresh 시도하여 세션 복구
 * 3. AuthModal 전역 렌더링
 *
 * 이 컴포넌트는 children을 절대 막지 않는다.
 *
 * 과거에 `if (!_hasHydrated) return null` 로 전체 트리를 차단했는데,
 * _hasHydrated는 브라우저에서 Zustand가 localStorage를 읽은 뒤에만 true가 되므로
 * 서버에서는 항상 false였다. 결과적으로 prerender된 9개 라우트 전부가
 * 본문 텍스트 0자인 빈 껍데기(13KB, 스크립트 태그만)로 배포되어 SSR/SSG가
 * 완전히 무력화됐고, Lighthouse는 LCP 후보를 찾지 못했다(NO_LCP).
 *
 * 인증 상태에 따라 모양이 달라지는 UI(헤더의 로그인 버튼/프로필)는 각자
 * _hasHydrated를 보고 스켈레톤 → 확정 상태로 전환한다. 차단은 그 지점에서만 한다.
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
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setIsAuthReady = useAuthStore((s) => s.setIsAuthReady);

  const triedRef = useRef(false);

  // 2-b. 인증 토큰 복구 (Silent Refresh — 앱 부팅 시 1회)
  useEffect(() => {
    // Zustand Persist Hydration이 완료될 때까지 대기
    if (!_hasHydrated || triedRef.current) return;
    triedRef.current = true;

    // [핵심] 첫 마운트 시 무조건 refresh 시도하여 쿠키에 있는 세션 확인
    (async () => {
      try {
        // api/client.ts에 정의된 중앙 리프레시 로직 사용
        const success = await tryRefreshToken();

        if (!success) {
          useAuthStore.getState().setIsLoggedIn(false);
          useAuthStore.getState().setUser(null);
        }
      } catch (err) {
        useAuthStore.getState().setIsLoggedIn(false);
      } finally {
        setIsAuthReady(true);
      }
    })();
  }, [_hasHydrated, setIsAuthReady]);

  return (
    <>
      {children}
      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
