/**
 * useSave 훅 테스트 (Constitution III 준수)
 *
 * - sajuResultId 유무에 따른 저장 흐름
 * - 성공/실패 토스트 검증
 * - isSaving 상태 전환 검증
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSave } from '@/hooks/useSave';
import { useSessionStore } from '@/stores/sessionStore';

jest.mock('@/lib/api/client', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('@/lib/toast', () => ({
  toastUtils: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { apiFetch } = jest.requireMock('@/lib/api/client') as { apiFetch: jest.Mock };
const { toastUtils } = jest.requireMock('@/lib/toast') as {
  toastUtils: { success: jest.Mock; error: jest.Mock };
};

describe('useSave', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
    jest.clearAllMocks();
  });

  it('초기 상태: isSaving이 false이다', () => {
    const { result } = renderHook(() => useSave('CAREER_TIMING'));
    expect(result.current.isSaving).toBe(false);
  });

  it('sajuResultId가 없을 때 save() 호출 시 에러 토스트를 표시하고 apiFetch를 호출하지 않는다', async () => {
    // sajuResultId는 null (기본 상태)
    const { result } = renderHook(() => useSave('CAREER_TIMING'));

    await act(async () => {
      await result.current.save();
    });

    expect(toastUtils.error).toHaveBeenCalledWith('저장할 분석 결과가 없습니다');
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('sajuResultId가 있을 때 save() 호출 시 올바른 body로 apiFetch를 호출한다', async () => {
    useSessionStore.getState().setSajuResultId('test-result-123');
    apiFetch.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSave('CONSULTATION'));

    await act(async () => {
      await result.current.save();
    });

    expect(apiFetch).toHaveBeenCalledWith('/api/saju-result/save', {
      method: 'POST',
      body: { sajuResultId: 'test-result-123', analysisType: 'CONSULTATION' },
    });
  });

  it('저장 성공 시 성공 토스트를 표시한다', async () => {
    useSessionStore.getState().setSajuResultId('test-result-456');
    apiFetch.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSave('COMPATIBILITY'));

    await act(async () => {
      await result.current.save();
    });

    expect(toastUtils.success).toHaveBeenCalledWith('분석 결과가 저장되었습니다');
  });

  it('저장 실패 시 에러 토스트를 표시한다', async () => {
    useSessionStore.getState().setSajuResultId('test-result-789');
    apiFetch.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useSave('CAREER_TIMING'));

    await act(async () => {
      await result.current.save();
    });

    expect(toastUtils.error).toHaveBeenCalledWith('저장에 실패했습니다. 다시 시도해주세요.');
  });

  it('save() 실행 중 isSaving이 true이고, 완료 후 false가 된다', async () => {
    useSessionStore.getState().setSajuResultId('test-result-999');

    let resolveFetch!: () => void;
    apiFetch.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { result } = renderHook(() => useSave('CAREER_TIMING'));

    act(() => {
      result.current.save();
    });

    await waitFor(() => expect(result.current.isSaving).toBe(true));

    await act(async () => {
      resolveFetch();
    });

    expect(result.current.isSaving).toBe(false);
  });
});
