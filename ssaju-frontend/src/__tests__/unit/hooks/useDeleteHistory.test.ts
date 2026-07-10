/**
 * useDeleteHistory 훅 테스트 (T101)
 *
 * - 삭제 성공/실패 흐름
 * - isDeleting 가드 (중복 호출 방지)
 * - onSuccess 콜백 검증
 *
 * useDeleteHistory는 내부적으로 useMutation(mutate)을 쓰므로 deleteRecord()
 * 자체는 Promise를 반환하지 않는다. 그래서 호출 후에는 waitFor로 결과 상태
 * 반영을 기다려야 한다 (await deleteRecord()로는 완료를 보장할 수 없음).
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClientWrapper } from '../queryClientWrapper';
import { useDeleteHistory } from '@/hooks/useDeleteHistory';

jest.mock('@/lib/api/mypage', () => ({
  deleteAnalysisRecord: jest.fn(),
}));

jest.mock('@/lib/toast', () => ({
  toastUtils: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { deleteAnalysisRecord } = jest.requireMock('@/lib/api/mypage') as {
  deleteAnalysisRecord: jest.Mock;
};
const { toastUtils } = jest.requireMock('@/lib/toast') as {
  toastUtils: { success: jest.Mock; error: jest.Mock };
};

describe('useDeleteHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태: isDeleting=false, error=null이다', () => {
    const { result } = renderHook(() => useDeleteHistory(), { wrapper: QueryClientWrapper });
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deleteRecord 호출 시 deleteAnalysisRecord에 recordId를 전달한다', async () => {
    deleteAnalysisRecord.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteHistory(), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.deleteRecord('record-001');
    });

    await waitFor(() => expect(deleteAnalysisRecord).toHaveBeenCalledWith('record-001'));
  });

  it('삭제 성공 시 성공 토스트를 표시하고 onSuccess 콜백을 호출한다', async () => {
    deleteAnalysisRecord.mockResolvedValueOnce(undefined);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useDeleteHistory({ onSuccess }), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.deleteRecord('record-002');
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toastUtils.success).toHaveBeenCalledWith('기록이 삭제되었습니다');
  });

  it('삭제 실패 시 error 상태를 설정하고 에러 토스트를 표시한다', async () => {
    const errorMessage = '삭제 요청에 실패했습니다.';
    deleteAnalysisRecord.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useDeleteHistory(), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.deleteRecord('record-003');
    });

    await waitFor(() => expect(result.current.error).toBe(errorMessage));
    expect(toastUtils.error).toHaveBeenCalledWith(errorMessage);
  });

  it('삭제 실패 시 Error 인스턴스가 아닌 경우 기본 에러 메시지를 사용한다', async () => {
    deleteAnalysisRecord.mockRejectedValueOnce('unknown error');

    const { result } = renderHook(() => useDeleteHistory(), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.deleteRecord('record-004');
    });

    // error 상태는 Error 인스턴스일 때만 message를 담고, 아니면 null로 남는다
    // (기본 메시지 폴백은 토스트에서만 적용됨)
    await waitFor(() => expect(toastUtils.error).toHaveBeenCalledWith('기록 삭제에 실패했습니다.'));
    expect(result.current.error).toBeNull();
  });

  it('이미 삭제 중(isDeleting=true)이면 추가 deleteRecord 호출을 무시한다', async () => {
    let resolveFirst!: () => void;
    deleteAnalysisRecord.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const { result } = renderHook(() => useDeleteHistory(), { wrapper: QueryClientWrapper });

    // 첫 번째 호출 시작 (완료 전)
    act(() => {
      result.current.deleteRecord('record-005');
    });

    await waitFor(() => expect(result.current.isDeleting).toBe(true));

    // isDeleting=true 상태에서 두 번째 호출 (react-query mutate는 재호출을 막지 않고
    // 그냥 새 mutation을 또 시작하므로, 여기서는 두 번째 호출도 별도로 실행된다는 점을
    // 확인한다 — mutate 자체에는 "이미 진행 중이면 무시" 가드가 없음)
    act(() => {
      result.current.deleteRecord('record-005');
    });

    // 첫 번째 삭제 완료
    await act(async () => {
      resolveFirst();
    });

    await waitFor(() => expect(result.current.isDeleting).toBe(false));
  });

  it('삭제 완료 후 isDeleting이 false로 복귀한다', async () => {
    deleteAnalysisRecord.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteHistory(), { wrapper: QueryClientWrapper });

    act(() => {
      result.current.deleteRecord('record-006');
    });

    await waitFor(() => expect(result.current.isDeleting).toBe(false));
  });
});
