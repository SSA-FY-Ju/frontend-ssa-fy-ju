'use client';

/**
 * 분석 기록 상세 조회 훅
 *
 * - useQuery로 캐싱 (같은 id 재방문 시 API 재호출 없음)
 * - enabled: id가 있을 때만 실행
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAnalysisRecord } from '@/lib/api/mypage';

export function useHistoryDetail(recordId: string, type: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['history', recordId, type],
    queryFn: () => fetchAnalysisRecord(recordId, type),
    enabled: !!recordId && !!type,
  });

  return {
    record: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
