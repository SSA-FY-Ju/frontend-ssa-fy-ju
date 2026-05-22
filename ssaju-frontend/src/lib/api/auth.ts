/**
 * 인증 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/auth/login      - 이메일/패스워드 로그인 → accessToken 반환
 * - POST /api/auth/signup     - 회원가입
 * - POST /api/auth/check-email - 이메일 중복 확인
 * - POST /api/auth/logout     - 로그아웃
 */

import { apiFetch, ApiError } from './client';
import { config } from '../config/env';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  termsAgreed: boolean;
  privacyAgreed: boolean;
}

/**
 * 이메일/패스워드 로그인
 * 백엔드가 accessToken을 응답 헤더(Authorization: Bearer ...)로 내려줌
 */
export async function login(req: LoginRequest): Promise<LoginResult> {
  const res = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const msg = json?.error?.message ?? json?.message ?? '로그인에 실패했습니다.';
    throw new ApiError(res.status, json?.error?.code ?? 'LOGIN_FAILED', msg, 'unknown');
  }

  // accessToken은 응답 헤더에서 읽음
  const authHeader = res.headers.get('authorization') ?? res.headers.get('Authorization') ?? '';
  const accessToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!accessToken) {
    throw new ApiError(500, 'NO_TOKEN', '서버에서 인증 토큰을 받지 못했습니다.', 'unknown');
  }

  return { accessToken };
}

/**
 * 회원가입
 */
export async function signup(req: SignupRequest): Promise<void> {
  await apiFetch<unknown>('/api/auth/signup', {
    method: 'POST',
    body: req,
    timeout: 10000,
    retry: { maxAttempts: 1 },
  });
}

/**
 * 이메일 중복 확인
 * 서버 응답 data: "AVAILABLE" → 사용 가능, 그 외 문자열 → 이미 사용 중
 */
export async function checkEmail(email: string): Promise<string> {
  return apiFetch<string>('/api/auth/check-email', {
    method: 'POST',
    body: { email },
    timeout: 5000,
    retry: { maxAttempts: 1 },
  });
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  await apiFetch<void>('/api/auth/logout', {
    method: 'POST',
    timeout: 5000,
    retry: { maxAttempts: 1 },
  });
}
