/**
 * MSW 기업 API 핸들러
 */

import { http, HttpResponse, delay } from 'msw';
import { mockCompatibilityResult, mockCompanyAutocomplete } from '../data/company';

export const companyHandlers = [
  // 기업 궁합 분석
  http.post('/api/company/compatibility', async () => {
    await delay(2000);
    return HttpResponse.json({
      success: true,
      data: mockCompatibilityResult,
      error: null,
      timestamp: Date.now(),
    });
  }),

  // 기업명 자동완성 (스펙 미포함 — mock 유지)
  http.post('/api/company/autocomplete', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockCompanyAutocomplete,
      error: null,
      timestamp: Date.now(),
    });
  }),
];
