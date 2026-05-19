'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { useSessionStore } from '@/stores/sessionStore';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '@/lib/api/auth';
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
      authStore.setAccessToken(result.accessToken);
      // TODO: 로그인 후 /api/auth/me 또는 별도 유저 정보 API 연결 시 setUser 호출
      authStore.setIsLoggedIn(true);
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
