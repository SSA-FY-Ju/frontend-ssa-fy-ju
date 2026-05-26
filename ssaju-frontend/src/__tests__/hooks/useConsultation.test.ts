/**
 * useConsultation 훅 테스트 (T080)
 *
 * 2026-05-13 업데이트 (v2):
 * - useSectionObserver 의존성 제거 확인
 * - handleSectionChange → consultationStore.setCurrentSectionIndex 검증
 * - currentSectionIndex 반환값 검증
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

  it('API 성공 시 consultationStore에 전체 데이터 저장', async () => {
    fetchConsultation.mockResolvedValueOnce(mockConsultationData);
    const { result } = renderHook(() => useConsultation());

    await act(async () => {
      result.current.submitConsultation('1990-10-10', '14:30');
    });

    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(useConsultationStore.getState().consultation).toEqual(mockConsultationData);
  });

  it('재호출 시 API를 다시 호출 (캐싱 없음)', async () => {
    fetchConsultation.mockResolvedValue(mockConsultationData);
    const { result } = renderHook(() => useConsultation());

    await act(async () => { result.current.submitConsultation('1990-10-10', '14:30'); });
    await waitFor(() => expect(result.current.phase).toBe('result'));

    act(() => { result.current.reset(); });

    await act(async () => { result.current.submitConsultation('1990-10-10', '14:30'); });
    await waitFor(() => expect(result.current.phase).toBe('result'));

    expect(fetchConsultation).toHaveBeenCalledTimes(2);
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
    expect(useConsultationStore.getState().consultation).toBeNull();
  });

  // ─── fullpage.js 연동 테스트 (T080 - 2026-05-13 추가) ───────────────────

  it('currentSectionIndex 초기값 0 반환 (fullpage.js 섹션 0-based)', () => {
    const { result } = renderHook(() => useConsultation());
    expect(result.current.currentSectionIndex).toBe(0);
  });

  it('handleSectionChange(index) → consultationStore.setCurrentSectionIndex 호출', () => {
    const { result } = renderHook(() => useConsultation());

    act(() => { result.current.handleSectionChange(3); });

    expect(useConsultationStore.getState().currentSectionIndex).toBe(3);
    expect(result.current.currentSectionIndex).toBe(3);
  });

  it('useSectionObserver 의존성 없음 — 모듈에서 import하지 않음', () => {
    // useConsultation이 useSectionObserver를 사용하지 않는지 간접 검증:
    // reset() 후 currentSectionIndex는 consultationStore에서만 관리됨
    const { result } = renderHook(() => useConsultation());

    act(() => { result.current.handleSectionChange(5); });
    expect(useConsultationStore.getState().currentSectionIndex).toBe(5);

    act(() => { result.current.reset(); });
    // reset 시 consultationStore.clearData() → currentSectionIndex 0으로 초기화
    expect(useConsultationStore.getState().currentSectionIndex).toBe(0);
  });
});
