'use client';

/**
 * 분석 기록 상세 조회 훅 (T100)
 *
 * - recordId로 단일 분석 기록 fetch
 * - 상태: record, isLoading, error
 */

import { useState, useCallback } from 'react';
import { fetchAnalysisRecord } from '@/lib/api/mypage';
import type { AnalysisRecord } from '@/types/api';

interface UseHistoryDetailReturn {
  record: AnalysisRecord | null;
  isLoading: boolean;
  error: string | null;
  fetchDetail: (recordId: string) => Promise<void>;
  reset: () => void;
}

export function useHistoryDetail(): UseHistoryDetailReturn {
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 분석 기록 상세 조회 */
  const fetchDetail = useCallback(async (recordId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAnalysisRecord(recordId);
      setRecord(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '기록 상세를 불러오는 데 실패했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 상태 초기화 */
  const reset = useCallback(() => {
    setRecord(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { record, isLoading, error, fetchDetail, reset };
}
