/**
 * 기업 분석 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/company/compatibility  - 기업 궁합 분석 (Spring Boot 백엔드)
 * - POST /api/company/autocomplete   - 기업명 자동완성 (Spring Boot 백엔드)
 * - GET  /api/company/search         - DART 기업명 검색 (Next.js 내부 프록시)
 * - GET  /api/company/detail         - DART 기업 설립일 조회 (Next.js 내부 프록시)
 */

import { apiFetch, axiosInstance, TIMEOUTS } from './client';
import type { CompatibilityRequest, CompatibilityResult } from '@/types/api';

export interface CompanyAutocompleteRequest {
  query: string;
}

export interface CompanyAutocompleteResponse {
  suggestions: string[];
}

/**
 * 기업 궁합 분석
 */
export async function fetchCompatibility(
  request: CompatibilityRequest,
): Promise<CompatibilityResult> {
  return apiFetch<CompatibilityResult>('/api/company/compatibility', {
    method: 'POST',
    body: request,
    timeout: TIMEOUTS.DEFAULT,
  });
}

/**
 * 기업명 자동완성
 */
export async function fetchCompanyAutocomplete(
  request: CompanyAutocompleteRequest,
): Promise<CompanyAutocompleteResponse> {
  return apiFetch<CompanyAutocompleteResponse>('/api/company/autocomplete', {
    method: 'POST',
    body: request,
    timeout: TIMEOUTS.SHORT,
  });
}

/* ── DART API (Next.js 내부 프록시 경유) ──────────────────────────────────────
 * Spring Boot 백엔드가 아닌 Next.js /api 라우트를 호출하므로 ApiResponse<T> 포맷이
 * 아님. apiFetch 미사용, axiosInstance 직접 사용.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface DartCompany {
  corpName: string;
  corpCode: string;
  stockCode: string; // 상장사: 종목코드, 비상장: ''
}

export interface DartCompanyDetail {
  corpName: string;
  foundingDate: string | null;
}

/** DART 기업명 검색 */
export async function searchDartCompanies(query: string): Promise<DartCompany[]> {
  try {
    const res = await axiosInstance.get(`/api/company/search`, { params: { q: query } });
    return res.data?.list ?? [];
  } catch {
    return [];
  }
}

/** DART 기업 설립일 조회 (corpCode → foundingDate) */
export async function fetchDartCompanyDetail(corpCode: string): Promise<DartCompanyDetail | null> {
  try {
    const res = await axiosInstance.get(`/api/company/detail`, { params: { corpCode } });
    return res.data;
  } catch {
    return null;
  }
}
