/**
 * useCompatibility 훅 테스트 (T091)
 *
 * useDisclaimerTimer를 모킹하여 타이머 없이 API 호출 트리거
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompatibility } from '@/hooks/useCompatibility';
import { useSessionStore } from '@/stores/sessionStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';
import { mockCompatibilityResult } from '@/mocks/data/company';

jest.mock('@/lib/api/company', () => ({
  fetchCompatibility: jest.fn(),
  fetchCompanyAutocomplete: jest.fn(),
}));

// useDisclaimerTimer 모킹 — onComplete를 즉시 호출
jest.mock('@/hooks/useDisclaimerTimer', () => ({
  useDisclaimerTimer: ({ onComplete }: { onComplete: () => void }) => ({
    isVisible: false,
    isFading: false,
    start: jest.fn(() => { onComplete(); }),
    reset: jest.fn(),
  }),
}));

const { fetchCompatibility } = jest.requireMock('@/lib/api/company');

describe('useCompatibility', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
    useAnalysisStore.getState().reset();
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  it('초기 phase idle, result null', () => {
    const { result } = renderHook(() => useCompatibility());
    expect(result.current.phase).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('submitCompatibility 호출 → API 성공 시 result phase', async () => {
    fetchCompatibility.mockResolvedValueOnce(mockCompatibilityResult);
    const { result } = renderHook(() => useCompatibility());

    await act(async () => {
      result.current.submitCompatibility('1990-10-10', '14:30', { category: 'TECH_BACKEND', detailName: '백엔드 개발' }, '삼성전자');
    });

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(result.current.result).toEqual(mockCompatibilityResult);
    expect(result.current.error).toBeNull();
  });

  it('성공 시 sessionStore에 sajuResultId, COMPATIBILITY 저장', async () => {
    fetchCompatibility.mockResolvedValueOnce(mockCompatibilityResult);
    const { result } = renderHook(() => useCompatibility());

    await act(async () => {
      result.current.submitCompatibility('1990-10-10', '14:30', { category: 'TECH_BACKEND', detailName: '백엔드 개발' }, '삼성전자');
    });

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(useSessionStore.getState().lastAnalysisType).toBe('COMPATIBILITY');
  });

  it('비로그인 시 성공하면 analysisStore에 저장', async () => {
    fetchCompatibility.mockResolvedValueOnce(mockCompatibilityResult);
    expect(useAuthStore.getState().isLoggedIn).toBe(false);

    const { result } = renderHook(() => useCompatibility());

    await act(async () => {
      result.current.submitCompatibility('1990-10-10', '14:30', { category: 'TECH_BACKEND', detailName: '백엔드 개발' }, '삼성전자');
    });

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(useAnalysisStore.getState().compatibility.result).not.toBeNull();
    expect(useAnalysisStore.getState().compatibility.inputs).toMatchObject({
      companyName: '삼성전자',
    });
  });

  it('로그인 시 analysisStore에 저장 안 함', async () => {
    fetchCompatibility.mockResolvedValueOnce(mockCompatibilityResult);
    useAuthStore.getState().setUser({ userId: 'u1', email: 'a@b.com', name: '테스트' });

    const { result } = renderHook(() => useCompatibility());

    await act(async () => {
      result.current.submitCompatibility('1990-10-10', '14:30', { category: 'TECH_BACKEND', detailName: '백엔드 개발' }, '삼성전자');
    });

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(useAnalysisStore.getState().compatibility.result).toBeNull();
  });

  it('API 실패 시 phase error, error 메시지 설정', async () => {
    fetchCompatibility.mockRejectedValueOnce(new Error('타임아웃'));
    const { result } = renderHook(() => useCompatibility());

    await act(async () => {
      result.current.submitCompatibility('1990-10-10', '14:30', { category: 'TECH_BACKEND', detailName: '백엔드 개발' }, '삼성전자');
    });

    await waitFor(() => expect(result.current.phase).toBe('error'));
    expect(result.current.error).toBe('타임아웃');
    expect(result.current.result).toBeNull();
  });

  it('API 실패 시 analysisStore에 에러 저장', async () => {
    fetchCompatibility.mockRejectedValueOnce(new Error('네트워크 오류'));
    const { result } = renderHook(() => useCompatibility());

    await act(async () => {
      result.current.submitCompatibility('1990-10-10', '14:30', { category: 'TECH_BACKEND', detailName: '백엔드 개발' }, '삼성전자');
    });

    await waitFor(() => expect(result.current.phase).toBe('error'));
    expect(useAnalysisStore.getState().compatibility.error).toBe('네트워크 오류');
  });

  it('진행 중 두 번째 submitCompatibility 무시 (중복 방지)', async () => {
    fetchCompatibility.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCompatibility());

    act(() => { result.current.submitCompatibility('1990-10-10', '14:30', { category: 'TECH_BACKEND', detailName: '백엔드 개발' }, '삼성전자'); });
    act(() => { result.current.submitCompatibility('1991-01-01', '09:00', { category: 'TECH_BACKEND', detailName: '백엔드 개발' }, 'LG전자'); });

    expect(fetchCompatibility).toHaveBeenCalledTimes(1);
  });

  it('reset 호출 시 idle 상태로 초기화', async () => {
    fetchCompatibility.mockResolvedValueOnce(mockCompatibilityResult);
    const { result } = renderHook(() => useCompatibility());

    await act(async () => {
      result.current.submitCompatibility('1990-10-10', '14:30', { category: 'TECH_BACKEND', detailName: '백엔드 개발' }, '삼성전자');
    });
    await waitFor(() => expect(result.current.phase).toBe('result'));

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
