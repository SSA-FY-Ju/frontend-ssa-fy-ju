/**
 * useFeedback 훅 테스트 (T096)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
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
    const { result } = renderHook(() => useFeedback('CAREER_TIMING'));
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sajuResultId 없을 때 제출 시 error 설정 (API 미호출)', async () => {
    const { result } = renderHook(() => useFeedback('CAREER_TIMING'));

    await act(async () => {
      result.current.submit('SATISFIED');
    });

    expect(result.current.error).toBeTruthy();
    expect(submitFeedback).not.toHaveBeenCalled();
  });

  it('제출 성공 시 success 토스트 + onSuccess 콜백 호출', async () => {
    submitFeedback.mockResolvedValueOnce({ success: true, feedbackId: 'fb-001' });
    useSessionStore.getState().setSajuResultId('saju-001');
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useFeedback('CAREER_TIMING', onSuccess));

    await act(async () => {
      result.current.submit('SATISFIED', '좋았습니다');
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    expect(toastUtils.success).toHaveBeenCalledWith('피드백이 저장되었습니다');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it('제출 성공 시 올바른 요청 구조로 API 호출', async () => {
    submitFeedback.mockResolvedValueOnce({ success: true, feedbackId: 'fb-002' });
    useSessionStore.getState().setSajuResultId('saju-002');

    const { result } = renderHook(() => useFeedback('CONSULTATION'));

    await act(async () => {
      result.current.submit('UNSATISFIED', '개선 필요');
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    expect(submitFeedback).toHaveBeenCalledWith({
      sajuResultId: 'saju-002',
      feedbackType: 'CONSULTATION',
      satisfactionStatus: 'UNSATISFIED',
      feedbackContent: '개선 필요',
    });
  });

  it('feedbackContent 빈 문자열이면 undefined로 전달', async () => {
    submitFeedback.mockResolvedValueOnce({ success: true, feedbackId: 'fb-003' });
    useSessionStore.getState().setSajuResultId('saju-003');

    const { result } = renderHook(() => useFeedback('COMPATIBILITY'));

    await act(async () => {
      result.current.submit('SATISFIED', '   ');
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    expect(submitFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ feedbackContent: undefined }),
    );
  });

  it('제출 실패 시 error 메시지 설정', async () => {
    submitFeedback.mockRejectedValueOnce(new Error('서버 오류'));
    useSessionStore.getState().setSajuResultId('saju-004');

    const { result } = renderHook(() => useFeedback('CAREER_TIMING'));

    await act(async () => {
      result.current.submit('SATISFIED');
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(toastUtils.success).not.toHaveBeenCalled();
  });

  it('제출 중 isSubmitting true', async () => {
    submitFeedback.mockReturnValue(new Promise(() => {})); // 무한 대기
    useSessionStore.getState().setSajuResultId('saju-005');

    const { result } = renderHook(() => useFeedback('CAREER_TIMING'));

    act(() => { result.current.submit('SATISFIED'); });

    expect(result.current.isSubmitting).toBe(true);
  });
});
