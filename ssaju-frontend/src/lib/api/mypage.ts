/**
 * 마이페이지 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/my-page/history        - 분석 기록 목록 (무한 스크롤)
 * - GET  /api/my-page/history/{id}   - 분석 기록 상세
 * - DELETE /api/my-page/history/{id} - 분석 기록 삭제
 */

import { apiFetch } from './client';
import type { AnalysisRecord, AnalysisHistoryResponse } from '@/types/api';

export interface AnalysisHistoryRequest {
  type: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';
  page: number;
  limit: number;
}

/**
 * 분석 기록 목록 조회 (무한 스크롤 지원)
 * 타임아웃: 10초
 */
export async function fetchAnalysisHistory(
  request: AnalysisHistoryRequest,
): Promise<AnalysisHistoryResponse> {
  return apiFetch<AnalysisHistoryResponse>('/api/my-page/history', {
    method: 'POST',
    body: request,
    timeout: 10000,
  });
}

/**
 * 분석 기록 상세 조회
 * 타임아웃: 5초
 */
export async function fetchAnalysisRecord(recordId: string): Promise<AnalysisRecord> {
  return apiFetch<AnalysisRecord>(`/api/my-page/history/${recordId}`, {
    method: 'GET',
    timeout: 5000,
  });
}

/**
 * 분석 기록 삭제
 * 타임아웃: 10초
 */
export async function deleteAnalysisRecord(recordId: string): Promise<void> {
  await apiFetch<void>(`/api/my-page/history/${recordId}`, {
    method: 'DELETE',
    timeout: 10000,
    retry: { maxAttempts: 1 },
  });
}
