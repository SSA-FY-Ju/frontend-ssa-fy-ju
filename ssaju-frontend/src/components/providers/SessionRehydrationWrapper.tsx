'use client';

import { useEffect, useRef } from 'react';
import { useSessionRehydration } from '@/hooks/useSessionRehydration';
import dynamic from 'next/dynamic';

// AuthModal 을 dynamic import 로 분리한 이유: 이 래퍼는 루트 레이아웃에 있어
// 정적 import 하면 Radix Dialog 체인(64kB raw)이 모든 라우트의 초기 페이로드에 실린다.
// 모달이 열리는 순간에만 청크를 받도록 미룬다. ssr:false — 열림 상태는 클라이언트 전용이다.
const AuthModal = dynamic(() => import('@/components/auth/AuthModal/AuthModal').then((m) => m.AuthModal), { ssr: false });
import { useAuthStore } from '@/stores/authStore';
import { isAccessTokenLikelyValid, tryRefreshToken } from '@/lib/api/client';

/**
 * Session 복원 래퍼 컴포넌트
 *
 * 동작:
 * 1. 앱 부팅 시 sessionStorage 세션 데이터 복원 (useSessionRehydration)
 * 2. 첫 mount 시 세션 복구가 필요한 경우에만 silent refresh (로그인 이력이 있고
 *    accessToken 이 만료됐을 때)
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

    // 로그인 이력이 없으면(영속된 isLoggedIn=false) refresh 는 항상 401 로 실패한다.
    // 첫 방문자·로그아웃 사용자에게까지 매 페이지 로드마다 실패 확정 요청을 보내던
    // 낭비를 제거한다. 이 경우 복구할 세션이 없으므로 곧바로 auth-ready 로 넘어간다.
    if (!useAuthStore.getState().isLoggedIn) {
      setIsAuthReady(true);
      return;
    }

    // accessToken 이 아직 유효한 시간대라면 복구할 것이 없다. 토큰 수명(10분) 안에
    // 페이지를 이동할 때마다 갱신을 한 번씩 보내던 낭비를 없앤다. 저장된 만료 시각이
    // 틀렸더라도 첫 API 요청이 401 을 받아 인터셉터가 갱신하므로 스스로 복구된다.
    if (isAccessTokenLikelyValid()) {
      setIsAuthReady(true);
      return;
    }

    // 토큰이 만료됐을 때만 쿠키 세션 복구를 시도한다.
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
      {isLoginModalOpen && <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />}
    </>
  );
}
