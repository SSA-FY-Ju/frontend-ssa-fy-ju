'use client';

import { useEffect, useRef } from 'react';
import { useSessionRehydration } from '@/hooks/useSessionRehydration';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/stores/authStore';
import { config } from '@/lib/config/env';

/**
 * Session 복원 래퍼 컴포넌트
 *
 * 동작:
 * - 앱 부팅 시 sessionStorage 세션 데이터 복원
 * - isLoggedIn=true이지만 accessToken이 없을 때(브라우저 재시작 등) refreshToken 쿠키로 자동 재발급
 * - 미들웨어가 ?openModal=true로 리다이렉트한 경우 → Zustand 복원(_hasHydrated) 즉시 모달 오픈
 * - AuthModal 전역 렌더링
 */
export function SessionRehydrationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionRehydration();

  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setIsAuthReady = useAuthStore((s) => s.setIsAuthReady);
  const logout = useAuthStore((s) => s.logout);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  const silentRefreshTriedRef = useRef(false);
  const modalTriedRef = useRef(false);

  // 미들웨어가 ?openModal=true로 리다이렉트한 경우
  // isAuthReady를 기다리지 않고 _hasHydrated 즉시 모달 오픈 (지연 없음)
  useEffect(() => {
    if (!_hasHydrated || modalTriedRef.current) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('openModal') !== 'true') return;

    modalTriedRef.current = true;

    // URL 파라미터 즉시 제거
    params.delete('openModal');
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);

    // refreshToken이 없어서 미들웨어가 리다이렉트한 것이므로 모달 오픈
    openLoginModal();
  }, [_hasHydrated, openLoginModal]);

  // Silent refresh: 로그인 상태인데 accessToken 없을 때(브라우저 재시작)
  useEffect(() => {
    if (!_hasHydrated || silentRefreshTriedRef.current) return;
    silentRefreshTriedRef.current = true;

    if (!isLoggedIn || accessToken) {
      setIsAuthReady(true);
      return;
    }

    (async () => {
      try {
        console.log('[SessionRehydration] silent refresh 시도...');
        const res = await fetch(`${config.apiBaseUrl}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        console.log('[SessionRehydration] refresh 응답 status:', res.status);
        if (res.ok) {
          const json = await res.json();
          const authHeader = res.headers.get('authorization') ?? '';
          let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
          if (!token) token = json?.data?.accessToken ?? json?.accessToken ?? '';

          if (token) {
            console.log('[SessionRehydration] 토큰 재발급 성공');
            setAccessToken(token);
          } else {
            console.log('[SessionRehydration] 토큰 없음 → 로그아웃');
            logout();
          }
        } else {
          console.log('[SessionRehydration] refresh 실패 →  로그아웃');
          logout();
        }
      } catch (err) {
        console.log('[SessionRehydration] 네트워크 오류 → 로그인 상태 유지:', err);
      } finally {
        setIsAuthReady(true);
      }
    })();
  }, [_hasHydrated, isLoggedIn, accessToken, setAccessToken, setIsAuthReady, logout]);

  return (
    <>
      {children}
      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
