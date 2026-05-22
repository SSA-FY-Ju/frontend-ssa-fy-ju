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

  const triedRef = useRef(false);

  useEffect(() => {
    if (!_hasHydrated || triedRef.current) return;
    triedRef.current = true;

    // 로그인 안 됐거나 이미 토큰 있으면 바로 ready
    if (!isLoggedIn || accessToken) {
      setIsAuthReady(true);
      return;
    }

    // 로그인 상태인데 토큰 없음(브라우저 재시작) → refreshToken 쿠키로 재발급
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
          console.log('[SessionRehydration] refresh 응답 전체:', JSON.stringify(json));

          // 응답 헤더에서 토큰 확인 (login과 동일하게 헤더 우선)
          const authHeader = res.headers.get('authorization') ?? '';
          let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
          if (!token) token = json?.data?.accessToken ?? json?.accessToken ?? '';

          console.log('[SessionRehydration] 추출된 토큰:', token ? '있음' : '없음');
          if (token) {
            console.log('[SessionRehydration] 토큰 재발급 성공');
            setAccessToken(token);
          } else {
            console.log('[SessionRehydration] 토큰 없음 → 로그아웃');
            logout();
          }
        } else {
          // refreshToken 만료 → 조용히 로그아웃
          console.log('[SessionRehydration] refresh 실패 (status:', res.status, ') → 로그아웃');
          logout();
        }
      } catch (err) {
        // 네트워크 오류 → 로그아웃하지 않고 유지 (사용자가 재시도 가능)
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
