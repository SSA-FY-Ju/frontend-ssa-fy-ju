'use client';

/**
 * 분석 기록 상세 조회 훅
 * API 명세(GET /api/mypage/analyses/{id})에 맞춰 업데이트
 */

import { useState, useCallback } from 'react';
import { fetchAnalysisRecord } from '@/lib/api/mypage';
import type { AnalysisRecord } from '@/types/api';

interface UseHistoryDetailReturn {
  record: AnalysisRecord | null;
  isLoading: boolean;
  error: string | null;
  fetchDetail: (recordId: string, type: string) => Promise<void>;
  reset: () => void;
}

export function useHistoryDetail(): UseHistoryDetailReturn {
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 분석 기록 상세 조회 */
  const fetchDetail = useCallback(async (recordId: string, type: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAnalysisRecord(recordId, type);
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
