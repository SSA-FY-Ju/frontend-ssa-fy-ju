'use client';

/**
 * 분석 기록 삭제 훅 (T101)
 *
 * - recordId로 분석 기록 삭제
 * - 성공 시 토스트 표시 + onSuccess 콜백 호출
 * - 상태: isDeleting, error
 */

import { useState, useCallback } from 'react';
import { deleteAnalysisRecord } from '@/lib/api/mypage';
import { toastUtils } from '@/lib/toast';

interface UseDeleteHistoryOptions {
  onSuccess?: () => void;
}

interface UseDeleteHistoryReturn {
  deleteRecord: (recordId: string) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteHistory(options?: UseDeleteHistoryOptions): UseDeleteHistoryReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 분석 기록 삭제 */
  const deleteRecord = useCallback(
    async (recordId: string) => {
      if (isDeleting) return;

      setIsDeleting(true);
      setError(null);

      try {
        await deleteAnalysisRecord(recordId);
        toastUtils.success('기록이 삭제되었습니다');
        options?.onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : '기록 삭제에 실패했습니다.';
        setError(message);
        toastUtils.error(message);
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting, options],
  );

  return { deleteRecord, isDeleting, error };
}
