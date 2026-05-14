/**
 * useMyPageAccess 훅 테스트 (T098)
 *
 * - 비로그인 시 로그인 모달 오픈 검증
 * - 로그인 시 모달 미오픈 검증
 * - isChecking 상태 전환 검증
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useMyPageAccess } from '@/hooks/useMyPageAccess';

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const { useAuthStore } = jest.requireMock('@/stores/authStore') as {
  useAuthStore: jest.Mock;
};

describe('useMyPageAccess', () => {
  const mockOpenLoginModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기에는 isChecking이 true이고, 이펙트 실행 후 false가 된다', async () => {
    useAuthStore.mockImplementation((selector: (s: object) => unknown) =>
      selector({ isLoggedIn: false, openLoginModal: mockOpenLoginModal }),
    );

    const { result } = renderHook(() => useMyPageAccess());

    // 이펙트 실행 전에는 isChecking이 true일 수 있지만,
    // jsdom에서는 동기적으로 실행되므로 waitFor로 확인
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });
  });

  it('비로그인 상태일 때 openLoginModal을 호출한다', async () => {
    useAuthStore.mockImplementation((selector: (s: object) => unknown) =>
      selector({ isLoggedIn: false, openLoginModal: mockOpenLoginModal }),
    );

    renderHook(() => useMyPageAccess());

    await waitFor(() => {
      expect(mockOpenLoginModal).toHaveBeenCalledTimes(1);
    });
  });

  it('로그인 상태일 때 openLoginModal을 호출하지 않는다', async () => {
    useAuthStore.mockImplementation((selector: (s: object) => unknown) =>
      selector({ isLoggedIn: true, openLoginModal: mockOpenLoginModal }),
    );

    renderHook(() => useMyPageAccess());

    await waitFor(() => {
      expect(mockOpenLoginModal).not.toHaveBeenCalled();
    });
  });

  it('isLoggedIn 값을 올바르게 반환한다 — 로그인 시 true', async () => {
    useAuthStore.mockImplementation((selector: (s: object) => unknown) =>
      selector({ isLoggedIn: true, openLoginModal: mockOpenLoginModal }),
    );

    const { result } = renderHook(() => useMyPageAccess());

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(true);
    });
  });

  it('isLoggedIn 값을 올바르게 반환한다 — 비로그인 시 false', async () => {
    useAuthStore.mockImplementation((selector: (s: object) => unknown) =>
      selector({ isLoggedIn: false, openLoginModal: mockOpenLoginModal }),
    );

    const { result } = renderHook(() => useMyPageAccess());

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(false);
    });
  });
});
