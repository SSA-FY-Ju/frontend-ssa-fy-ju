/**
 * 마이페이지 API 래퍼
 *
 * 엔드포인트:
 * - GET    /api/mypage                 - 마이페이지 정보 및 분석 기록 목록
 * - GET    /api/mypage/analyses/{id}   - 분석 결과 상세
 * - DELETE /api/my-page/history/{id}   - 분석 기록 삭제
 */

import { apiFetch, TIMEOUTS } from './client';
import type { AnalysisRecord, MyPageData } from '@/types/api';

export interface MyPageRequest {
  type?: 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';
  page?: number;
  size?: number;
}

/**
 * 마이페이지 정보 조회 (유저 정보 + 분석 리스트)
 */
export async function fetchMyPageData(
  params: MyPageRequest = {},
  headers: Record<string, string> = {},
): Promise<MyPageData> {
  const query = new URLSearchParams();
  if (params.type) query.append('type', params.type);
  if (params.page !== undefined) query.append('page', params.page.toString());
  if (params.size !== undefined) query.append('size', params.size.toString());

  const queryString = query.toString();
  const path = `/api/mypage${queryString ? `?${queryString}` : ''}`;

  return apiFetch<MyPageData>(path, {
    method: 'GET',
    timeout: TIMEOUTS.DEFAULT,
    headers,
  });
}

/**
 * 분석 기록 상세 조회
 */
export async function fetchAnalysisRecord(
  recordId: string | number,
  type: string,
): Promise<AnalysisRecord> {
  const TYPE_MAP: Record<string, string> = {
    TIMING:        'SAJU',
    CONSULTATION:  'CAREER_CONSULTATION',
    COMPATIBILITY: 'COMPANY_COMPATIBILITY',
  };
  const typeParam = TYPE_MAP[type] ?? type;

  return apiFetch<AnalysisRecord>(`/api/mypage/analyses/${recordId}?type=${typeParam}`, {
    method: 'GET',
    timeout: TIMEOUTS.SHORT,
  });
}

/**
 * 분석 기록 삭제
 */
export async function deleteAnalysisRecord(recordId: string): Promise<void> {
  await apiFetch<void>(`/api/my-page/history/${recordId}`, {
    method: 'DELETE',
    timeout: TIMEOUTS.DEFAULT,
    retry: { maxAttempts: 1 },
  });
}
