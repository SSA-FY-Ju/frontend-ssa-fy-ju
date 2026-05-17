/**
 * MSW 인증 API 핸들러
 *
 * 상태를 메모리에 유지하여 로그인/로그아웃이 실제처럼 동작함
 */

import { http, HttpResponse, delay } from 'msw';
import { mockUser } from '../data/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// 세션 상태 — 개발 편의를 위해 기본값은 로그인 상태
// 로그아웃하면 false로 바뀌고, 페이지 새로고침 시에도 서비스워커가 유지되므로 상태 유지됨
const sessionState: { isLoggedIn: boolean } = { isLoggedIn: true };

export const authHandlers = [
  // 인증 상태 확인
  http.get(`${BASE_URL}/api/auth/status`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        isLoggedIn: sessionState.isLoggedIn,
        user: sessionState.isLoggedIn ? mockUser : null,
      },
      error: null,
      timestamp: Date.now(),
    });
  }),

  // 로그아웃
  http.post(`${BASE_URL}/api/auth/logout`, async () => {
    await delay(100);
    sessionState.isLoggedIn = false;
    return HttpResponse.json({
      success: true,
      data: null,
      error: null,
      timestamp: Date.now(),
    });
  }),

  // 개발용: 로그인 강제 설정 (실제 OAuth 없이 테스트)
  http.post(`${BASE_URL}/api/auth/dev-login`, async () => {
    sessionState.isLoggedIn = true;
    return HttpResponse.json({
      success: true,
      data: { isLoggedIn: true, user: mockUser },
      error: null,
      timestamp: Date.now(),
    });
  }),
];
