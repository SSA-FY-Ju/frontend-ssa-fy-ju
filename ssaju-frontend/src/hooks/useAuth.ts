'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { useSessionStore } from '@/stores/sessionStore';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '@/lib/api/auth';
import { fetchMyPageData } from '@/lib/api/mypage';
import type { LoginRequest, SignupRequest } from '@/lib/api/auth';

/**
 * 인증 관리 훅
 *
 * 기능:
 * - 이메일/패스워드 로그인 (JWT accessToken 메모리 저장)
 * - 회원가입
 * - 로그아웃 (모든 스토어 초기화)
 */
export function useAuth() {
  const authStore = useAuthStore();

  const login = async (req: LoginRequest) => {
    authStore.setIsLoading(true);
    authStore.setLoginError(null);
    try {
      const result = await loginApi(req);
      const token = result.accessToken;
      authStore.setAccessToken(token);
      authStore.setIsLoggedIn(true);

      // [핵심 추가] 로그인 직후 즉시 마이페이지 정보를 가져와 유저 정보 동기화
      try {
        const myPageData = await fetchMyPageData(
          { page: 0, size: 1 },
          { Authorization: `Bearer ${token}` }
        );

        if (myPageData?.profile) {
          authStore.setUser({
            userId: String(myPageData.profile.id),
            name: myPageData.profile.name,
            email: myPageData.profile.email,
          });
        }
      } catch (userErr) {
        // 실패하더라도 토큰이 있으므로 기본 정보는 세팅
        authStore.setUser({
          userId: 'unknown',
          name: req.email.split('@')[0],
          email: req.email,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
      authStore.setLoginError(message);
      throw err;
    } finally {
      authStore.setIsLoading(false);
    }
  };

  const signup = async (req: SignupRequest) => {
    authStore.setIsLoading(true);
    authStore.setLoginError(null);
    try {
      await signupApi(req);
      // 회원가입 후 자동 로그인
      await login({ email: req.email, password: req.password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.';
      authStore.setLoginError(message);
      authStore.setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // 로그아웃 API 실패해도 클라이언트 상태는 초기화
    } finally {
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
    login,
    signup,
    logout,
  };
}
