/**
 * useConsultation 훅 테스트 (T080)
 *
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

  it('submitConsultation 호출 → disclaimer phase → API 성공 시 result', async () => {
    fetchConsultation.mockResolvedValueOnce(mockConsultationData);
    const { result } = renderHook(() => useConsultation());

    await act(async () => {
      result.current.submitConsultation('1990-10-10', '14:30');
    });

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(result.current.consultation).toEqual(mockConsultationData);
  });

  it('API 성공 시 consultationStore에 전체 데이터 캐싱', async () => {
    fetchConsultation.mockResolvedValueOnce(mockConsultationData);
    const { result } = renderHook(() => useConsultation());

    await act(async () => {
      result.current.submitConsultation('1990-10-10', '14:30');
    });

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(useConsultationStore.getState().consultation).toEqual(mockConsultationData);
  });

  it('캐시 유효 시 API 재호출 없이 즉시 result', () => {
    useConsultationStore.getState().setConsultation(mockConsultationData, 'saju-001');
    const { result } = renderHook(() => useConsultation());

    act(() => { result.current.submitConsultation('1990-10-10', '14:30', 'saju-001'); });

    expect(result.current.phase).toBe('result');
    expect(fetchConsultation).not.toHaveBeenCalled();
  });

  it('탭 선택 시 selectedTabIndex 업데이트', async () => {
    fetchConsultation.mockResolvedValueOnce(mockConsultationData);
    const { result } = renderHook(() => useConsultation());

    await act(async () => { result.current.submitConsultation('1990-10-10', '14:30'); });
    await waitFor(() => expect(result.current.phase).toBe('result'));

    act(() => { result.current.selectTab(3); });
    expect(result.current.selectedTabIndex).toBe(3);
  });

  it('API 실패 시 phase error, error 메시지 설정', async () => {
    fetchConsultation.mockRejectedValueOnce(new Error('AI 타임아웃'));
    const { result } = renderHook(() => useConsultation());

    await act(async () => { result.current.submitConsultation('1990-10-10', '14:30'); });
    await waitFor(() => expect(result.current.phase).toBe('error'));

    expect(result.current.error).toBe('AI 타임아웃');
    expect(result.current.consultation).toBeNull();
  });

  it('reset 호출 시 전체 초기화', async () => {
    fetchConsultation.mockResolvedValueOnce(mockConsultationData);
    const { result } = renderHook(() => useConsultation());

    await act(async () => { result.current.submitConsultation('1990-10-10', '14:30'); });
    await waitFor(() => expect(result.current.phase).toBe('result'));

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('idle');
    expect(result.current.consultation).toBeNull();
  });
});
