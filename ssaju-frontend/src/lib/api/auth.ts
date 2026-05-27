/**
 * 인증 API 래퍼
 *
 * 엔드포인트:
 * - POST /api/auth/login      - 이메일/패스워드 로그인 → accessToken 반환
 * - POST /api/auth/signup     - 회원가입
 * - POST /api/auth/check-email - 이메일 중복 확인
 * - POST /api/auth/logout     - 로그아웃
 */

import { apiFetch, ApiError, TIMEOUTS } from './client';
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
 *
 * apiFetch 미사용 이유: 백엔드가 accessToken을 응답 헤더(Authorization: Bearer ...)로
 * 내려주므로 헤더 파싱이 필요함. apiFetch는 ApiResponse<T>.data만 반환하기 때문에
 * 헤더 접근이 불가능하여 raw fetch를 사용.
 */
export async function login(req: LoginRequest): Promise<LoginResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.DEFAULT);

  try {
    const res = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = json?.error?.message ?? json?.message ?? '로그인에 실패했습니다.';
      throw new ApiError(res.status, json?.error?.code ?? 'LOGIN_FAILED', msg, 'unknown');
    }

    // 1순위: 응답 헤더 Authorization (백엔드가 헤더로 내려주는 경우)
    const authHeader = res.headers.get('authorization') ?? '';
    let accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    // 2순위: 응답 body의 data.accessToken (명세 기준)
    if (!accessToken) {
      accessToken = json?.data?.accessToken ?? '';
    }

    if (!accessToken) {
      throw new ApiError(500, 'NO_TOKEN', '서버에서 인증 토큰을 받지 못했습니다.', 'unknown');
    }

    return { accessToken };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 회원가입
 */
export async function signup(req: SignupRequest): Promise<void> {
  await apiFetch<unknown>('/api/auth/signup', {
    method: 'POST',
    body: req,
    timeout: TIMEOUTS.DEFAULT,
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
    timeout: TIMEOUTS.SHORT,
    retry: { maxAttempts: 1 },
  });
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  await apiFetch<void>('/api/auth/logout', {
    method: 'POST',
    timeout: TIMEOUTS.SHORT,
    retry: { maxAttempts: 1 },
  });
}

/**
 * 회원 탈퇴
 * 비밀번호 확인 후 계정 삭제, refreshToken 쿠키 제거
 */
export async function deleteAccount(password: string): Promise<void> {
  await apiFetch<void>('/api/users/me', {
    method: 'DELETE',
    body: { password },
    timeout: TIMEOUTS.DEFAULT,
    retry: { maxAttempts: 1 },
  });
}
