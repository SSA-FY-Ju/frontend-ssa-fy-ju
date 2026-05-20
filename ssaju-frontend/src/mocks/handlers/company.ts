/**
 * MSW 기업 API 핸들러
 *
 * /api/company/compatibility — 실제 API 연결 (핸들러 제거)
 * /api/company/autocomplete  — 스펙 미포함, mock 유지
 */

import { http, HttpResponse, delay } from 'msw';
import { mockCompanyAutocomplete } from '../data/company';

export const companyHandlers = [
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
