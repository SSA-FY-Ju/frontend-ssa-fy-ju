/**
 * useAuth 훅 테스트
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

jest.mock('@/lib/api/auth', () => ({
  fetchAuthStatus: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('@/services/auth/oauth', () => ({
  getKakaoAuthUrl: jest.fn().mockResolvedValue('https://kakao.oauth.url'),
  getGoogleAuthUrl: jest.fn().mockResolvedValue('https://google.oauth.url'),
  clearOAuthStorage: jest.fn(),
}));

jest.mock('@/hooks/usePlatformDetect', () => ({
  usePlatformDetect: () => ({
    isMobile: jest.fn().mockReturnValue(false),
    openOAuthWindow: jest.fn().mockImplementation((_url: string, onSuccess?: () => void) => {
      onSuccess?.();
    }),
  }),
}));

const { fetchAuthStatus, logout: logoutApi } = jest.requireMock('@/lib/api/auth');

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  it('초기 상태는 비로그인', async () => {
    fetchAuthStatus.mockResolvedValueOnce({ isLoggedIn: false, user: null });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('fetchAuthStatus 성공 시 로그인 상태 설정', async () => {
    const mockUser = {
      userId: 'user-001',
      name: '테스트 유저',
      socialProvider: 'KAKAO' as const,
    };
    fetchAuthStatus.mockResolvedValueOnce({ isLoggedIn: true, user: mockUser });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(true);
    });

    expect(result.current.user?.userId).toBe('user-001');
  });

  it('fetchAuthStatus 실패 시 비로그인 상태 유지', async () => {
    fetchAuthStatus.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isLoggedIn).toBe(false);
  });

  it('logout 호출 시 모든 스토어 초기화', async () => {
    fetchAuthStatus.mockResolvedValueOnce({ isLoggedIn: false, user: null });
    logoutApi.mockResolvedValueOnce(undefined);

    useAuthStore.getState().setUser({
      userId: 'user-001',
      name: '테스트',
      socialProvider: 'KAKAO',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.logout();

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('logout API 실패해도 클라이언트 상태 초기화', async () => {
    fetchAuthStatus.mockResolvedValueOnce({ isLoggedIn: false, user: null });
    logoutApi.mockRejectedValueOnce(new Error('Server error'));

    useAuthStore.getState().setUser({
      userId: 'user-001',
      name: '테스트',
      socialProvider: 'GOOGLE',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.logout();

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
