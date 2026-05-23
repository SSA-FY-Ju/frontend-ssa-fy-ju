/**
 * 마이페이지 API 래퍼
 *
 * 엔드포인트:
 * - GET  /api/mypage                 - 마이페이지 정보 및 분석 기록 목록 (API 명세 기준)
 * - GET  /api/mypage/analyses/{id}   - 분석 결과 상세 (API 명세 기준)
 * - DELETE /api/users/me             - 회원 탈퇴 (API 명세 기준)
 */

import { apiFetch } from './client';
import type { AnalysisRecord, MyPageData } from '@/types/api';

export interface MyPageRequest {
  type?: 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';
  page?: number;
  size?: number;
}

/**
 * 마이페이지 정보 조회 (유저 정보 + 분석 리스트)
 * API 명세: GET /api/mypage
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
    timeout: 10000,
    headers,
  });
}

/**
 * 분석 기록 상세 조회
 * API 명세: GET /api/mypage/analyses/{id}
 */
export async function fetchAnalysisRecord(
  recordId: string | number,
  type: string,
): Promise<AnalysisRecord> {
  return apiFetch<AnalysisRecord>(`/api/mypage/analyses/${recordId}?type=${type}`, {
    method: 'GET',
    timeout: 5000,
  });
}

/**
 * 분석 기록 삭제 (기존 기능 유지 - 명세에는 없지만 UI에서 필요할 수 있음)
 */
export async function deleteAnalysisRecord(recordId: string): Promise<void> {
  // 실제 명세에는 DELETE /api/users/me (탈퇴)만 있지만, 
  // 기록 삭제 기능이 UI에 있으므로 기존 엔드포인트 유지 시도
  await apiFetch<void>(`/api/my-page/history/${recordId}`, {
    method: 'DELETE',
    timeout: 10000,
    retry: { maxAttempts: 1 },
  });
}
