'use client';

// 파일 크기 예외: 인증 복원·카카오 로그인·구글 로그인·로그아웃 등 인증 관련
// 모든 액션을 한 훅에 응집시켜 authStore 상태 일관성 및 스토어 초기화 원자성 보장
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { useSessionStore } from '@/stores/sessionStore';
import { fetchAuthStatus, logout as logoutApi } from '@/lib/api/auth';
import { getKakaoAuthUrl, getGoogleAuthUrl } from '@/services/auth/oauth';
import { usePlatformDetect } from './usePlatformDetect';

/**
 * 인증 관리 훅
 *
 * 기능:
 * - 페이지 로드 시 자동 인증 복원
 * - 카카오/구글 소셜 로그인
 * - 로그아웃 (모든 스토어 초기화)
 */
export function useAuth() {
  const authStore = useAuthStore();
  const { openOAuthWindow } = usePlatformDetect();

  // 페이지 로드 시 인증 상태 복원
  useEffect(() => {
    const restoreAuth = async () => {
      authStore.setIsLoading(true);
      try {
        const status = await fetchAuthStatus();
        if (status.isLoggedIn && status.user) {
          authStore.setUser(status.user);
        }
      } catch {
        // 인증 실패 시 비로그인 상태 유지
        authStore.reset();
      } finally {
        authStore.setIsLoading(false);
      }
    };

    restoreAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithKakao = async () => {
    try {
      authStore.setIsLoading(true);
      authStore.setLoginError(null);
      const url = await getKakaoAuthUrl();
      openOAuthWindow(url, async () => {
        // 팝업 닫힌 후 인증 상태 재확인
        const status = await fetchAuthStatus();
        if (status.isLoggedIn && status.user) {
          authStore.setUser(status.user);
        }
        authStore.setIsLoading(false);
      });
    } catch {
      authStore.setLoginError('카카오 로그인 중 오류가 발생했습니다.');
      authStore.setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      authStore.setIsLoading(true);
      authStore.setLoginError(null);
      const url = await getGoogleAuthUrl();
      openOAuthWindow(url, async () => {
        const status = await fetchAuthStatus();
        if (status.isLoggedIn && status.user) {
          authStore.setUser(status.user);
        }
        authStore.setIsLoading(false);
      });
    } catch {
      authStore.setLoginError('구글 로그인 중 오류가 발생했습니다.');
      authStore.setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // 로그아웃 API 실패해도 클라이언트 상태는 초기화
    } finally {
      // 모든 스토어 초기화
      useAuthStore.getState().reset();
      useAnalysisStore.getState().reset();
      useConsultationStore.getState().clearData();
      useSessionStore.getState().reset();
    }
  };

  return {
    isLoggedIn: authStore.isLoggedIn,
    user: authStore.user,
    isLoading: authStore.isLoading,
    loginError: authStore.loginError,
    loginWithKakao,
    loginWithGoogle,
    logout,
  };
}
