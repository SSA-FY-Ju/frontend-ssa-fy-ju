/**
 * 인증 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/auth/login      - 이메일/패스워드 로그인 → accessToken 반환
 * - POST /api/auth/signup     - 회원가입
 * - POST /api/auth/check-email - 이메일 중복 확인
 * - POST /api/auth/logout     - 로그아웃
 */

import { apiFetch } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  accessTokenExpiresIn: number;
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
 * 성공 시 accessToken 반환
 */
export async function login(req: LoginRequest): Promise<LoginResult> {
  return apiFetch<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: req,
    timeout: 10000,
    retry: { maxAttempts: 1 },
  });
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
