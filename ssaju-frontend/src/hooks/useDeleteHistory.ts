'use client';

/**
 * 분석 기록 삭제 훅
 *
 * - useMutation으로 삭제 처리
 * - 성공 시 mypage 쿼리 캐시 무효화 → 목록 자동 갱신
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAnalysisRecord } from '@/lib/api/mypage';
import { MYPAGE_QUERY_KEY } from './useMyPage';
import { toastUtils } from '@/lib/toast';

interface UseDeleteHistoryOptions {
  onSuccess?: () => void;
}

export function useDeleteHistory(options?: UseDeleteHistoryOptions) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (recordId: string) => deleteAnalysisRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MYPAGE_QUERY_KEY });
      toastUtils.success('기록이 삭제되었습니다');
      options?.onSuccess?.();
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : '기록 삭제에 실패했습니다.';
      toastUtils.error(message);
    },
  });

  return {
    deleteRecord: mutate,
    isDeleting: isPending,
    error: error instanceof Error ? error.message : null,
  };
}
