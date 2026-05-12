/**
 * MSW 인증 API 핸들러
 */

import { http, HttpResponse, delay } from 'msw';
import { mockAuthStatus } from '../data/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const authHandlers = [
  // 인증 상태 확인
  http.get(`${BASE_URL}/api/auth/status`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: mockAuthStatus,
      error: null,
      timestamp: Date.now(),
    });
  }),

  // 로그아웃
  http.post(`${BASE_URL}/api/auth/logout`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: null,
      error: null,
      timestamp: Date.now(),
    });
  }),
];
