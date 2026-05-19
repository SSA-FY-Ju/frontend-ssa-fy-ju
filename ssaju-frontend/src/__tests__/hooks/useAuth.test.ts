/**
 * useAuth 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

jest.mock('@/lib/api/auth', () => ({
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('@/stores/analysisStore', () => ({
  useAnalysisStore: { getState: () => ({ reset: jest.fn() }) },
}));

jest.mock('@/stores/consultationStore', () => ({
  useConsultationStore: { getState: () => ({ clearData: jest.fn() }) },
}));

jest.mock('@/stores/sessionStore', () => ({
  useSessionStore: { getState: () => ({ reset: jest.fn() }) },
}));

const { login: loginApi, logout: logoutApi } = jest.requireMock('@/lib/api/auth');

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  it('초기 상태는 비로그인', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login 성공 시 로그인 상태로 전환', async () => {
    loginApi.mockResolvedValueOnce({
      accessToken: 'test-token-123',
      accessTokenExpiresIn: 3600,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'password1' });
    });

    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('test-token-123');
  });

  it('login 실패 시 loginError 설정', async () => {
    loginApi.mockRejectedValueOnce(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login({ email: 'test@test.com', password: 'wrong' });
      } catch {
        // expected
      }
    });

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().loginError).toBeTruthy();
  });

  it('logout 호출 시 스토어 초기화', async () => {
    logoutApi.mockResolvedValueOnce(undefined);
    useAuthStore.getState().setUser({ userId: 'u1', email: 'a@b.com', name: '테스트' });
    useAuthStore.getState().setAccessToken('some-token');

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('logout API 실패해도 클라이언트 상태 초기화', async () => {
    logoutApi.mockRejectedValueOnce(new Error('Server error'));
    useAuthStore.getState().setUser({ userId: 'u1', email: 'a@b.com', name: '테스트' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
