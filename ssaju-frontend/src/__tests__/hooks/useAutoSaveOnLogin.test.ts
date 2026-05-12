/**
 * useAutoSaveOnLogin 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useAutoSaveOnLogin } from '@/hooks/useAutoSaveOnLogin';
import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';

// apiFetch 모킹
jest.mock('@/lib/api/client', () => ({
  apiFetch: jest.fn(),
}));

// toast 모킹
jest.mock('@/lib/toast', () => ({
  toastUtils: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { apiFetch } = jest.requireMock('@/lib/api/client');
const { toastUtils } = jest.requireMock('@/lib/toast');

describe('useAutoSaveOnLogin', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    useAnalysisStore.getState().reset();
    jest.clearAllMocks();
  });

  it('비로그인 상태에서는 저장 안 함', () => {
    renderHook(() => useAutoSaveOnLogin());
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('로그인 전환 시 분석 데이터 없으면 저장 안 함', async () => {
    const { rerender } = renderHook(() => useAutoSaveOnLogin());

    await act(async () => {
      useAuthStore.getState().setIsLoggedIn(true);
    });

    rerender();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('로그인 전환 시 분석 데이터 있으면 저장', async () => {
    apiFetch.mockResolvedValue({});

    // 분석 데이터 설정
    useAnalysisStore.getState().setCareerTimingResult({ sajuResultId: 'test-001' });

    renderHook(() => useAutoSaveOnLogin());

    await act(async () => {
      useAuthStore.getState().setIsLoggedIn(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(apiFetch).toHaveBeenCalledWith(
      '/api/saju-result/save',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ type: 'CAREER_TIMING' }),
      }),
    );
    expect(toastUtils.success).toHaveBeenCalledWith('분석 결과가 저장되었습니다');
  });

  it('저장 성공 시 analysisStore 초기화', async () => {
    apiFetch.mockResolvedValue({});
    useAnalysisStore.getState().setCareerTimingResult({ sajuResultId: 'test-001' });

    renderHook(() => useAutoSaveOnLogin());

    await act(async () => {
      useAuthStore.getState().setIsLoggedIn(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(useAnalysisStore.getState().careerTiming.result).toBeNull();
  });

  it('저장 실패 시 에러 토스트 표시', async () => {
    apiFetch.mockRejectedValue(new Error('API error'));
    useAnalysisStore.getState().setCareerTimingResult({ sajuResultId: 'test-001' });

    renderHook(() => useAutoSaveOnLogin());

    await act(async () => {
      useAuthStore.getState().setIsLoggedIn(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(toastUtils.error).toHaveBeenCalledWith('분석 결과 저장에 실패했습니다');
  });

  it('이미 로그인된 상태에서 재마운트 시 저장 안 함', async () => {
    useAuthStore.getState().setIsLoggedIn(true);
    useAnalysisStore.getState().setCareerTimingResult({ sajuResultId: 'test-001' });

    renderHook(() => useAutoSaveOnLogin());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(apiFetch).not.toHaveBeenCalled();
  });
});
