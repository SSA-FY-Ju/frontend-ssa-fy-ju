/**
 * 인증 API 래퍼
 *
 * 엔드포인트:
 * - GET  /api/auth/status  - 현재 인증 상태 확인
 * - POST /api/auth/logout  - 로그아웃 (HttpOnly 쿠키 삭제)
 */

import { apiFetch } from './client';
import type { User } from '@/types/api';

export interface AuthStatusResponse {
  isLoggedIn: boolean;
  user: User | null;
}

/**
 * 현재 인증 상태 확인
 * 타임아웃: 5초
 */
export async function fetchAuthStatus(): Promise<AuthStatusResponse> {
  if (process.env.NODE_ENV === 'development') {
    return { isLoggedIn: false, user: null };
  }
  return apiFetch<AuthStatusResponse>('/api/auth/status', {
    method: 'GET',
    timeout: 5000,
    retry: { maxAttempts: 1 },
  });
}

/**
 * 로그아웃 (백엔드에서 HttpOnly 쿠키 삭제)
 * 타임아웃: 5초
 */
export async function logout(): Promise<void> {
  await apiFetch<void>('/api/auth/logout', {
    method: 'POST',
    timeout: 5000,
    retry: { maxAttempts: 1 },
  });
}
