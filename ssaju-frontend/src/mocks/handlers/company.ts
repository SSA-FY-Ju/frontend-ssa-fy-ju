/**
 * MSW 기업 API 핸들러
 */

import { http, HttpResponse, delay } from 'msw';
import { mockCompatibilityResult, mockCompanyAutocomplete } from '../data/company';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const companyHandlers = [
  // 기업 궁합 분석
  http.post(`${BASE_URL}/api/company/compatibility`, async () => {
    await delay(800);
    return HttpResponse.json({
      success: true,
      data: mockCompatibilityResult,
      error: null,
      timestamp: Date.now(),
    });
  }),

  // 기업명 자동완성
  http.post(`${BASE_URL}/api/company/autocomplete`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockCompanyAutocomplete,
      error: null,
      timestamp: Date.now(),
    });
  }),
];
