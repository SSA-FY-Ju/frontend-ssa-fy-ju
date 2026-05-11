/**
 * 기업 분석 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/company/compatibility  - 기업 궁합 분석
 * - POST /api/company/autocomplete   - 기업명 자동완성
 */

import { apiFetch } from './client';
import type { CompatibilityRequest, CompatibilityResult } from '@/types/api';

export interface CompanyAutocompleteRequest {
  query: string;
}

export interface CompanyAutocompleteResponse {
  suggestions: string[];
}

/**
 * 기업 궁합 분석
 * 타임아웃: 10초
 */
export async function fetchCompatibility(
  request: CompatibilityRequest,
): Promise<CompatibilityResult> {
  return apiFetch<CompatibilityResult>('/api/company/compatibility', {
    method: 'POST',
    body: request,
    timeout: 10000,
  });
}

/**
 * 기업명 자동완성 (Q2: 백엔드 엔드포인트 사용)
 * 타임아웃: 5초
 */
export async function fetchCompanyAutocomplete(
  request: CompanyAutocompleteRequest,
): Promise<CompanyAutocompleteResponse> {
  return apiFetch<CompanyAutocompleteResponse>('/api/company/autocomplete', {
    method: 'POST',
    body: request,
    timeout: 5000,
  });
}
