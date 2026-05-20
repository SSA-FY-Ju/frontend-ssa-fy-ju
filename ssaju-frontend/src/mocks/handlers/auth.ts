/**
 * MSW 인증 API 핸들러 (이메일/패스워드 방식)
 *
 * 개발 편의를 위한 mock — 실제 백엔드 없이 로그인/회원가입 테스트 가능
 * 상대 경로 사용 → Next.js 프록시 라우트를 가로챔 (localhost:3000/api/auth/*)
 *
 * 테스트 계정:
 *   이메일: test@example.com / 비밀번호: 아무거나 → 로그인 성공
 *   이메일: taken@example.com → 이미 가입된 이메일 (check-email에서 available=false)
 *   이메일: error@example.com → 로그인 실패 (INVALID_CREDENTIALS)
 */

import { http, HttpResponse, delay } from 'msw';
import { mockUser } from '../data/auth';

// 개발용 가짜 토큰 (분석 API는 토큰 없이도 동작하므로 내용은 무관)
const MOCK_ACCESS_TOKEN = 'mock-dev-token-do-not-use-in-production';

export const authHandlers = [
  // 로그인 — 이메일/패스워드
  http.post('/api/auth/login', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { email: string; password: string };

    // error@example.com → 실패 시나리오
    if (body.email === 'error@example.com') {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.', requestId: 'mock-req-001' },
          timestamp: Date.now(),
        },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        accessToken: MOCK_ACCESS_TOKEN,
        accessTokenExpiresIn: 3600000,
      },
      error: null,
      timestamp: Date.now(),
    });
  }),

  // 회원가입
  http.post('/api/auth/signup', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { email: string; name: string };

    // taken@example.com → 이미 사용 중인 이메일 시나리오
    if (body.email === 'taken@example.com') {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'DUPLICATE_EMAIL', message: '이미 사용 중인 이메일입니다.', requestId: 'mock-req-002' },
          timestamp: Date.now(),
        },
        { status: 409 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: { userId: `mock-user-${Date.now()}` },
      error: null,
      timestamp: Date.now(),
    });
  }),

  // 이메일 중복 확인
  http.post('/api/auth/check-email', async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { email: string };
    const taken = body.email === 'taken@example.com' || body.email === mockUser.email;

    return HttpResponse.json({
      success: true,
      data: { available: !taken },
      error: null,
      timestamp: Date.now(),
    });
  }),

  // 로그아웃
  http.post('/api/auth/logout', async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: null,
      error: null,
      timestamp: Date.now(),
    });
  }),
];
