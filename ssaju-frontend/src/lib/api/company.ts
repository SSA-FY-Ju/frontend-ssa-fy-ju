/**
 * 기업 분석 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/company/compatibility  - 기업 궁합 분석 (Spring Boot 백엔드)
 * - POST /api/company/autocomplete   - 기업명 자동완성 (Spring Boot 백엔드)
 *
 * 기업명 자동완성 검색 GET /api/company/search 는 금융위원회 기업기본정보 API 를 쓰는 Next.js 프록시이며,
 * useCompanyAutocomplete 가 직접 호출한다.
 */

import { apiFetch, TIMEOUTS } from './client';
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

/** 기업명 자동완성 결과 - 금융위원회 기업기본정보의 법인명 */
export interface CompanySuggestion {
  corpName: string;
}
