/**
 * useCareerTiming 훅 테스트 (T034)
 *
 * 커버리지 대상:
 * - 성공 시 result 설정 및 sessionStore 저장
 * - 비로그인 시 analysisStore 저장
 * - API 실패 시 error 설정
 * - 중복 요청 방지 (Race Condition)
 * - reset 동작
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCareerTiming } from '@/hooks/useCareerTiming';
import { useSessionStore } from '@/stores/sessionStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';

// fetchCareerTiming API 모킹
jest.mock('@/lib/api/career', () => ({
  fetchCareerTiming: jest.fn(),
}));

const { fetchCareerTiming } = jest.requireMock('@/lib/api/career');

const mockResult = {
  sajuResultId: 'test-saju-001',
  h1Period: '2025년 상반기',
  h2Period: '2026년 하반기',
  h1Confidence: 82,
  h2Confidence: 65,
  recommendation: '상반기가 유리합니다.',
};

describe('useCareerTiming', () => {
  beforeEach(() => {
    // 스토어 초기화
    useSessionStore.getState().reset();
    useAnalysisStore.getState().reset();
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  it('초기 상태는 result null, loading false, error null', () => {
    const { result } = renderHook(() => useCareerTiming());

    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('submitAnalysis 성공 시 result 설정됨', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useCareerTiming());

    await act(async () => {
      await result.current.submitAnalysis('1990-10-10', '14:30');
    });

    expect(result.current.result).toEqual(mockResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('성공 시 sessionStore에 sajuResultId와 분석 타입 저장', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useCareerTiming());

    await act(async () => {
      await result.current.submitAnalysis('1990-10-10', '14:30');
    });

    expect(useSessionStore.getState().sajuResultId).toBe('test-saju-001');
    expect(useSessionStore.getState().lastAnalysisType).toBe('CAREER_TIMING');
  });

  it('비로그인 상태에서 성공 시 analysisStore에 저장', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);
    // 비로그인 상태 유지 (reset 이후 기본값)
    expect(useAuthStore.getState().isLoggedIn).toBe(false);

    const { result } = renderHook(() => useCareerTiming());

    await act(async () => {
      await result.current.submitAnalysis('1990-10-10', '14:30');
    });

    const analysisState = useAnalysisStore.getState();
    expect(analysisState.careerTiming.result).not.toBeNull();
    expect(analysisState.careerTiming.inputs).toEqual({
      birthDate: '1990-10-10',
      birthTime: '14:30',
    });
  });

  it('로그인 상태에서 성공 시 analysisStore에 저장하지 않음', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);
    // 로그인 상태 설정
    useAuthStore.getState().setUser({
      userId: 'user-001',
      name: '테스트',
      socialProvider: 'KAKAO',
    });

    const { result } = renderHook(() => useCareerTiming());

    await act(async () => {
      await result.current.submitAnalysis('1990-10-10', '14:30');
    });

    // 로그인 사용자는 analysisStore 사용 안 함
    expect(useAnalysisStore.getState().careerTiming.result).toBeNull();
  });

  it('시간 미입력 시 기본값 12:00으로 호출', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useCareerTiming());

    await act(async () => {
      await result.current.submitAnalysis('1990-10-10');
    });

    expect(fetchCareerTiming).toHaveBeenCalledWith(
      expect.objectContaining({ birthTime: '12:00' }),
    );
  });

  it('API 실패 시 error 상태 설정', async () => {
    fetchCareerTiming.mockRejectedValueOnce(new Error('타임아웃 오류'));

    const { result } = renderHook(() => useCareerTiming());

    await act(async () => {
      await result.current.submitAnalysis('1990-10-10', '14:30');
    });

    expect(result.current.error).toBe('타임아웃 오류');
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('API 실패 시 analysisStore에 에러 저장', async () => {
    fetchCareerTiming.mockRejectedValueOnce(new Error('네트워크 오류'));

    const { result } = renderHook(() => useCareerTiming());

    await act(async () => {
      await result.current.submitAnalysis('1990-10-10', '14:30');
    });

    expect(useAnalysisStore.getState().careerTiming.error).toBe('네트워크 오류');
  });

  it('진행 중 두 번째 submitAnalysis 호출 무시', async () => {
    // 첫 번째 호출이 지연되는 상황 시뮬레이션
    let resolveFirst!: (v: typeof mockResult) => void;
    fetchCareerTiming.mockReturnValueOnce(
      new Promise((res) => {
        resolveFirst = res;
      }),
    );
    fetchCareerTiming.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useCareerTiming());

    // 첫 번째 호출 시작 (완료 안 됨)
    act(() => {
      result.current.submitAnalysis('1990-10-10', '14:30');
    });

    // 첫 번째가 아직 진행 중일 때 두 번째 호출
    await act(async () => {
      await result.current.submitAnalysis('1991-01-01', '09:00');
    });

    // fetchCareerTiming은 한 번만 호출돼야 함
    expect(fetchCareerTiming).toHaveBeenCalledTimes(1);

    // 첫 번째 완료
    await act(async () => {
      resolveFirst(mockResult);
    });
  });

  it('reset 호출 시 상태 초기화', async () => {
    fetchCareerTiming.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useCareerTiming());

    await act(async () => {
      await result.current.submitAnalysis('1990-10-10', '14:30');
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('submitAnalysis 호출 중 loading 상태는 true', async () => {
    // 완료되지 않는 Promise로 로딩 상태 유지
    fetchCareerTiming.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useCareerTiming());

    act(() => {
      result.current.submitAnalysis('1990-10-10', '14:30');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });
});
