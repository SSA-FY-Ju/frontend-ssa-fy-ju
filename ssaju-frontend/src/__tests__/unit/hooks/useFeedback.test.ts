/**
 * useFeedback 훅 테스트 (T096)
 *
 * useFeedback은 useMutation(mutate)을 쓰므로 submit() 자체는 Promise를
 * 반환하지 않는다. 호출은 act()로 감싸고, 결과 상태는 waitFor로 기다린다.
 * sajuResultId는 Number()로 변환되어 analysisId로 쓰이므로 숫자 문자열이어야 한다.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClientWrapper } from '../queryClientWrapper';
import { useFeedback } from '@/hooks/useFeedback';
import { useSessionStore } from '@/stores/sessionStore';

jest.mock('@/lib/api/feedback', () => ({
  submitFeedback: jest.fn(),
}));

jest.mock('@/lib/toast', () => ({
  toastUtils: { success: jest.fn(), error: jest.fn() },
}));

const { submitFeedback } = jest.requireMock('@/lib/api/feedback');
const { toastUtils } = jest.requireMock('@/lib/toast');

describe('useFeedback', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
    jest.clearAllMocks();
  });

  it('초기 상태: isSubmitting false, error null', () => {
    const { result } = renderHook(() => useFeedback('CONSULTATION'), { wrapper: QueryClientWrapper });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sajuResultId 없을 때 제출 시 error 설정 (API 미호출)', async () => {
    const { result } = renderHook(() => useFeedback('CONSULTATION'), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.submit('SATISFIED');
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(submitFeedback).not.toHaveBeenCalled();
  });

  it('제출 성공 시 success 토스트 + onSuccess 콜백 호출', async () => {
    submitFeedback.mockResolvedValueOnce({ success: true, feedbackId: 'fb-001' });
    useSessionStore.getState().setSajuResultId('1001');
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useFeedback('CONSULTATION', onSuccess), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.submit('SATISFIED', '좋았습니다');
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toastUtils.success).toHaveBeenCalledWith('피드백이 저장되었습니다');
    expect(result.current.error).toBeNull();
  });

  it('제출 성공 시 올바른 요청 구조로 API 호출', async () => {
    submitFeedback.mockResolvedValueOnce({ success: true, feedbackId: 'fb-002' });
    useSessionStore.getState().setSajuResultId('1002');

    const { result } = renderHook(() => useFeedback('CONSULTATION'), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.submit('DISSATISFIED', '개선 필요');
    });

    await waitFor(() => expect(submitFeedback).toHaveBeenCalled());
    // UI 내부 명칭 CONSULTATION → 백엔드 enum 값 CAREER_CONSULTATION 으로 매핑되어야 한다
    expect(submitFeedback).toHaveBeenCalledWith({
      analysisId: 1002,
      feedbackType: 'CAREER_CONSULTATION',
      satisfactionStatus: 'DISSATISFIED',
      feedbackContent: '개선 필요',
    });
  });

  it('feedbackContent 빈 문자열이면 undefined로 전달', async () => {
    submitFeedback.mockResolvedValueOnce({ success: true, feedbackId: 'fb-003' });
    useSessionStore.getState().setSajuResultId('1003');

    const { result } = renderHook(() => useFeedback('COMPATIBILITY'), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.submit('SATISFIED', '   ');
    });

    await waitFor(() => expect(submitFeedback).toHaveBeenCalled());
    expect(submitFeedback).toHaveBeenCalledWith(
      // COMPATIBILITY → COMPANY_COMPATIBILITY 매핑도 함께 고정한다
      expect.objectContaining({
        feedbackType: 'COMPANY_COMPATIBILITY',
        feedbackContent: undefined,
      }),
    );
  });

  it('제출 실패 시 error 메시지 설정', async () => {
    submitFeedback.mockRejectedValueOnce(new Error('서버 오류'));
    useSessionStore.getState().setSajuResultId('1004');

    const { result } = renderHook(() => useFeedback('CONSULTATION'), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.submit('SATISFIED');
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(toastUtils.success).not.toHaveBeenCalled();
  });

  it('제출 중 isSubmitting true', async () => {
    submitFeedback.mockReturnValue(new Promise(() => {})); // 무한 대기
    useSessionStore.getState().setSajuResultId('1005');

    const { result } = renderHook(() => useFeedback('CONSULTATION'), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.submit('SATISFIED');
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(true));
  });
});
