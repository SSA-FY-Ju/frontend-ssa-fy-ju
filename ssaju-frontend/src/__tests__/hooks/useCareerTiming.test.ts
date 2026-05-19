/**
 * useCareerTiming 훅 테스트 (T034 / T063)
 *
 * 새 흐름: submitAnalysis → disclaimer(1.5s) → API 호출 → 결과
 * fake timer 사용으로 disclaimer 타이머 제어
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCareerTiming } from '@/hooks/useCareerTiming';
import { useSessionStore } from '@/stores/sessionStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';

jest.mock('@/lib/api/career', () => ({
  fetchCareerTiming: jest.fn(),
}));

jest.useFakeTimers();

const { fetchCareerTiming } = jest.requireMock('@/lib/api/career');

const mockResult = {
  sajuResultId: 'test-saju-001',
  h1Period: '2025년 상반기',
  h2Period: '2026년 하반기',
  h1Confidence: 82,
  h2Confidence: 65,
  recommendation: '상반기가 유리합니다.',
};

/** disclaimer(2000ms)를 빠르게 통과시키는 헬퍼 */
async function skipDisclaimer() {
  act(() => { jest.advanceTimersByTime(2000); });
}

describe('useCareerTiming', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
    useAnalysisStore.getState().reset();
    useAuthStore.getState().reset();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('초기 phase는 idle, result/error null', () => {
    const { result } = renderHook(() => useCareerTiming());
    expect(result.current.phase).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('submitAnalysis 호출 시 즉시 phase가 disclaimer로 전환', () => {
    const { result } = renderHook(() => useCareerTiming());

    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });

    expect(result.current.phase).toBe('disclaimer');
    expect(result.current.disclaimerVisible).toBe(true);
  });

  it('disclaimer 완료 후 phase가 loading으로 전환', async () => {
    fetchCareerTiming.mockReturnValueOnce(new Promise(() => {})); // 무한 대기
    const { result } = renderHook(() => useCareerTiming());

    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });
    await skipDisclaimer();

    expect(result.current.phase).toBe('loading');
    expect(result.current.loading).toBe(true);
  });

  it('API 성공 시 phase가 result, result 설정됨', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);
    const { result } = renderHook(() => useCareerTiming());

    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });
    await skipDisclaimer();

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it('성공 시 sessionStore에 sajuResultId와 분석 타입 저장', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);
    const { result } = renderHook(() => useCareerTiming());

    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });
    await skipDisclaimer();
    await waitFor(() => expect(result.current.phase).toBe('result'));

    expect(useSessionStore.getState().sajuResultId).toBe('test-saju-001');
    expect(useSessionStore.getState().lastAnalysisType).toBe('CAREER_TIMING');
  });

  it('비로그인 시 성공하면 analysisStore에 저장', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);
    expect(useAuthStore.getState().isLoggedIn).toBe(false);

    const { result } = renderHook(() => useCareerTiming());
    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });
    await skipDisclaimer();
    await waitFor(() => expect(result.current.phase).toBe('result'));

    expect(useAnalysisStore.getState().careerTiming.result).not.toBeNull();
    expect(useAnalysisStore.getState().careerTiming.inputs).toEqual({
      birthDate: '1990-10-10',
      birthTime: '14:30',
    });
  });

  it('로그인 시 성공해도 analysisStore에 저장 안 함', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);
    useAuthStore.getState().setUser({ userId: 'u1', email: 'a@b.com', name: '테스트' });

    const { result } = renderHook(() => useCareerTiming());
    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });
    await skipDisclaimer();
    await waitFor(() => expect(result.current.phase).toBe('result'));

    expect(useAnalysisStore.getState().careerTiming.result).toBeNull();
  });

  it('시간 미입력 시 기본값 12:00으로 API 호출', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);
    const { result } = renderHook(() => useCareerTiming());

    act(() => { result.current.submitAnalysis('1990-10-10'); });
    await skipDisclaimer();
    await waitFor(() => expect(result.current.phase).toBe('result'));

    expect(fetchCareerTiming).toHaveBeenCalledWith(
      expect.objectContaining({ birthTime: '12:00' }),
    );
  });

  it('API 실패 시 phase가 error, error 메시지 설정', async () => {
    fetchCareerTiming.mockRejectedValueOnce(new Error('타임아웃 오류'));
    const { result } = renderHook(() => useCareerTiming());

    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });
    await skipDisclaimer();
    await waitFor(() => expect(result.current.phase).toBe('error'));

    expect(result.current.error).toBe('타임아웃 오류');
    expect(result.current.result).toBeNull();
  });

  it('API 실패 시 analysisStore에 에러 저장', async () => {
    fetchCareerTiming.mockRejectedValueOnce(new Error('네트워크 오류'));
    const { result } = renderHook(() => useCareerTiming());

    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });
    await skipDisclaimer();
    await waitFor(() => expect(result.current.phase).toBe('error'));

    expect(useAnalysisStore.getState().careerTiming.error).toBe('네트워크 오류');
  });

  it('진행 중 두 번째 submitAnalysis 호출 무시 (중복 방지)', () => {
    fetchCareerTiming.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCareerTiming());

    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });
    act(() => { result.current.submitAnalysis('1991-01-01', '09:00'); });

    // disclaimer 완료 후에도 API는 1번만 호출돼야 함
    act(() => { jest.advanceTimersByTime(2000); });
    expect(fetchCareerTiming).toHaveBeenCalledTimes(1);
  });

  it('reset() 호출 시 phase idle, 결과 초기화', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);
    const { result } = renderHook(() => useCareerTiming());

    act(() => { result.current.submitAnalysis('1990-10-10', '14:30'); });
    await skipDisclaimer();
    await waitFor(() => expect(result.current.phase).toBe('result'));

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
