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
 * 1. 앱 부팅 시 sessionStorage 세션 데이터 복원 (useSessionRehydration)
 * 2. Zustand Hydration 대기 (_hasHydrated)
 * 3. 첫 mount 시 무조건 silent refresh 시도하여 세션 복구
 * 4. AuthModal 전역 렌더링
 *
 * 수정 사항:
 * - 새로고침 시 강제 로그아웃 튕김 현상을 막기 위해, 리프레시 실패 시에도 isLoggedIn을 false로 만들지 않음
 * - 대신 데이터 호출 시 발생하는 401 에러를 통해 자연스럽게 모달이 뜨도록 유도
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
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setIsAuthReady = useAuthStore((s) => s.setIsAuthReady);
  const setIsLoggedIn = useAuthStore((s) => s.setIsLoggedIn);

  const triedRef = useRef(false);

  // 2. 인증 토큰 복구 (Silent Refresh)
  useEffect(() => {
    if (!_hasHydrated || triedRef.current) return;
    triedRef.current = true;

    // 이미 메모리에 토큰 있으면 즉시 준비 완료
    if (accessToken) {
      setIsAuthReady(true);
      return;
    }

    // [핵심] 첫 마운트 시 무조건 refresh 시도하여 쿠키에 있는 세션 확인
    (async () => {
      try {
        console.log('[SessionRehydration] Silent refresh 시도 중...');
        const baseUrl = (config.apiBaseUrl || '').replace(/\/$/, '');
        
        // POST 요청 시 빈 본문({})을 함께 전송하여 서버 에러 방지
        const res = await fetch(`${baseUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          credentials: 'include',
        });
        
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const authHeader = res.headers.get('authorization') ?? res.headers.get('Authorization') ?? '';
          let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
          if (!token) token = json.data?.accessToken ?? json.accessToken ?? '';

          if (token) {
            setAccessToken(token);
            setIsLoggedIn(true);
            console.log('[SessionRehydration] 세션 복구 성공');
          }
        } else {
          // [수정] 리프레시 실패(401 등) 시에도 강제로 isLoggedIn을 false로 만들지 않음
          // 이렇게 해야 새로고침 시 랜딩 페이지로 튕기는 현상을 방지할 수 있음
          // 사용자가 실제로 데이터를 요청할 때(apiFetch) 인증 실패가 나면 그때 모달이 뜸
          console.warn('[SessionRehydration] 세션 복구 실패 (상태 코드:', res.status, ') -> 로그인 상태 유지 시도');
        }
      } catch (err) {
        console.error('[SessionRehydration] 네트워크 오류:', err);
      } finally {
        setIsAuthReady(true);
      }
    })();
  }, [_hasHydrated, isLoggedIn, accessToken, setAccessToken, setIsAuthReady, setIsLoggedIn]);

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
