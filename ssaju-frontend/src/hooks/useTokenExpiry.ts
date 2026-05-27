'use client';

/**
 * 액세스 토큰 만료 자동 갱신 훅
 *
 * 동작:
 * 1. accessToken의 JWT exp를 파싱하여 만료 5분 전에 자동 refresh 호출
 * 2. 탭이 다시 포커스될 때(visibilitychange) 만료 여부 추가 체크
 * 3. refresh 실패 시 logout + 로그인 모달 오픈
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { tryRefreshToken } from '@/lib/api/client';
import { getJwtExp, isTokenExpired } from '@/lib/jwt';

/** 만료 몇 초 전에 갱신할지 */
const REFRESH_BEFORE_SEC = 5 * 60; // 5분

async function doRefresh() {
  const success = await tryRefreshToken();
  if (!success) {
    const store = useAuthStore.getState();
    store.logout();
    store.openLoginModal();
  }
}

export function useTokenExpiry() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ① accessToken이 갱신될 때마다 다음 갱신 타이머 예약
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!accessToken || !isLoggedIn) return;

    const exp = getJwtExp(accessToken);
    if (exp === null) return; // JWT 형식이 아니면 스킵

    const msUntilRefresh = (exp - REFRESH_BEFORE_SEC) * 1000 - Date.now();

    if (msUntilRefresh <= 0) {
      // 이미 갱신 시점이 지났으면 즉시 시도
      doRefresh();
    } else {
      timerRef.current = setTimeout(doRefresh, msUntilRefresh);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [accessToken, isLoggedIn]);

  // ② 탭 전환 시 만료 여부 체크 (60초 여유)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;

      const store = useAuthStore.getState();
      if (!store.isLoggedIn || !store.accessToken) return;

      if (isTokenExpired(store.accessToken, 60)) {
        doRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
}
