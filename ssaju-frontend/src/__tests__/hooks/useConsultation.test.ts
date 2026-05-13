/**
 * useConsultation 훅 테스트 (T080)
 *
 * 2026-05-13 업데이트: 탭 선택 테스트 제거 → 스크롤 뷰 기준 테스트로 전환
 * useDisclaimerTimer를 모킹하여 타이머 없이 runApiCall을 직접 트리거
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useConsultation } from '@/hooks/useConsultation';
import { useConsultationStore } from '@/stores/consultationStore';
import { mockConsultationData } from '@/mocks/data/career';

jest.mock('@/lib/api/career', () => ({ fetchConsultation: jest.fn() }));

// useDisclaimerTimer 모킹 — onComplete를 즉시 호출하도록
jest.mock('@/hooks/useDisclaimerTimer', () => ({
  useDisclaimerTimer: ({ onComplete }: { onComplete: () => void }) => {
    return {
      isVisible: false,
      isFading: false,
      start: jest.fn(() => { onComplete(); }),
      reset: jest.fn(),
    };
  },
}));

const { fetchConsultation } = jest.requireMock('@/lib/api/career');

describe('useConsultation', () => {
  beforeEach(() => {
    useConsultationStore.getState().reset();
    jest.clearAllMocks();
  });

  it('초기 phase는 idle, consultation null', () => {
    const { result } = renderHook(() => useConsultation());
    expect(result.current.phase).toBe('idle');
    expect(result.current.consultation).toBeNull();
  });

  it('submitConsultation 호출 → API 성공 시 phase result', async () => {
    fetchConsultation.mockResolvedValueOnce(mockConsultationData);
    const { result } = renderHook(() => useConsultation());

    await act(async () => {
      result.current.submitConsultation('1990-10-10', '14:30');
    });

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(result.current.consultation).toEqual(mockConsultationData);
  });

  it('API 성공 시 consultationStore에 전체 데이터 캐싱 (스크롤 뷰 즉시 렌더링 가능)', async () => {
    fetchConsultation.mockResolvedValueOnce(mockConsultationData);
    const { result } = renderHook(() => useConsultation());

    await act(async () => {
      result.current.submitConsultation('1990-10-10', '14:30');
    });

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(useConsultationStore.getState().consultation).toEqual(mockConsultationData);
    expect(useConsultationStore.getState().lastFetchedId).toBe(mockConsultationData.sajuResultId);
  });

  it('캐시 유효 시 API 재호출 없이 즉시 result (스크롤 뷰 복원)', () => {
    useConsultationStore.getState().setConsultation(mockConsultationData, 'saju-001');
    const { result } = renderHook(() => useConsultation());

    act(() => { result.current.submitConsultation('1990-10-10', '14:30', 'saju-001'); });

    expect(result.current.phase).toBe('result');
    expect(fetchConsultation).not.toHaveBeenCalled();
  });

  it('API 실패 시 phase error, error 메시지 설정', async () => {
    fetchConsultation.mockRejectedValueOnce(new Error('AI 타임아웃'));
    const { result } = renderHook(() => useConsultation());

    await act(async () => { result.current.submitConsultation('1990-10-10', '14:30'); });
    await waitFor(() => expect(result.current.phase).toBe('error'));

    expect(result.current.error).toBe('AI 타임아웃');
    expect(result.current.consultation).toBeNull();
  });

  it('reset 호출 시 phase idle + consultationStore 초기화', async () => {
    fetchConsultation.mockResolvedValueOnce(mockConsultationData);
    const { result } = renderHook(() => useConsultation());

    await act(async () => { result.current.submitConsultation('1990-10-10', '14:30'); });
    await waitFor(() => expect(result.current.phase).toBe('result'));

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('idle');
    expect(result.current.consultation).toBeNull();
    expect(useConsultationStore.getState().lastFetchedId).toBeNull();
  });
});
