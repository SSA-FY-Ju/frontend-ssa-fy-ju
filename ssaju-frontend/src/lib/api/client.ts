// 파일 크기 예외: 재시도·타임아웃·에러 파싱 등 API 클라이언트 핵심 로직을
// 한 파일에 응집시켜야 일관성이 보장됨. 분리 시 순환 의존 위험
/**
 * 중앙 API 클라이언트 (apiFetch)
 *
 * Features:
 * - 타입 안전성 (제네릭)
 * - 자동 재시도 (Q5: 타임아웃/네트워크 에러만)
 * - 지수 백오프 (1s, 2s, 4s)
 * - HttpOnly 쿠키 자동 전송
 * - 타임아웃 관리
 * - 에러 처리
 */

import axios, { AxiosError } from 'axios';
import { config } from '../config/env';

export const axiosInstance = axios.create({ withCredentials: true });

interface FetchOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
  body?: unknown;
  timeout?: number;
  retry?: {
    maxAttempts?: number;
    backoff?: 'exponential';
  };
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  errorCode?: string;
  error?: { code: string; message: string; requestId?: string };
  timestamp: string | number;
  path?: string;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    public errorMessage: string,
    public requestId: string,
  ) {
    super(`API Error [${statusCode}]: ${errorMessage}`);
    this.name = 'ApiError';
  }
}

/**
 * 로딩 상태 업데이트 (에러 스토어)
 */
const updateLoadingState = (loading: boolean): void => {
  try {
    // 클라이언트 환경에서만 실행
    if (typeof window !== 'undefined') {
      const { useErrorStore } = require('@/stores/errorStore');
      useErrorStore.getState().setIsLoading(loading);
    }
  } catch {
    // 에러 스토어를 사용할 수 없으면 무시
  }
};

/** 현재 accessToken으로 Authorization 헤더 구성 (클라이언트 환경에서만) */
function getAuthHeader(): Record<string, string> {
  try {
    if (typeof window !== 'undefined') {
      const { useAuthStore } = require('@/stores/authStore');
      const token = useAuthStore.getState().accessToken;
      if (token) return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // 스토어 접근 실패 시 무시
  }
  return {};
}

/**
 * 토큰 갱신 잠금 변수 (중복 갱신 방지)
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * 토큰 갱신 시도
 * refreshToken HttpOnly 쿠키 → 백엔드 → 새 accessToken 응답 → authStore 갱신
 */
export async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = (config.apiBaseUrl || '').replace(/\/$/, '');
      const response = await axiosInstance.post(
        `${baseUrl}/api/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const json = response.data ?? {};

      // 1순위: 응답 헤더 Authorization (대소문자 무관하게 처리)
      const authHeader = response.headers['authorization'] ?? response.headers['Authorization'] ?? '';
      let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

      // 2순위: 응답 바디
      if (!token) {
        token = json.data?.accessToken ?? json.accessToken ?? '';
      }

      if (token) {
        // 새 accessToken을 authStore에 저장 및 로그인 상태 업데이트
        // user 정보(name, email)는 authStore localStorage에 영속되므로 별도 API 호출 불필요
        if (typeof window !== 'undefined') {
          const { useAuthStore } = require('@/stores/authStore');
          const store = useAuthStore.getState();
          store.setAccessToken(token);
          store.setIsLoggedIn(true);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}


/**
 * 중앙 API fetch 래퍼
 *
 * @param path - API 경로 (예: /api/career/timing)
 * @param options - fetch 옵션
 * @returns 타입이 지정된 응답 데이터
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    method = 'POST',
    body = null,
    timeout = 10000,
    retry = { maxAttempts: 3, backoff: 'exponential' },
    headers = {},
  } = options;

  const baseUrl = config.apiBaseUrl || '';
  // 경로가 /로 시작하고 baseUrl이 /로 끝나면 중복 방지
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl.replace(/\/$/, '')}${cleanPath}`;

  updateLoadingState(true);

  try {
    let lastError: Error | null = null;
    const maxAttempts = retry?.maxAttempts || 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axiosInstance.request<ApiResponse<T>>({
          url,
          method,
          data: body ?? undefined,
          timeout,
          withCredentials: true, // refreshToken HttpOnly 쿠키 자동 전송 (logout 등에서 필요)
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...headers,
          },
        });

        const json = response.data;

        if (json.success) {
          return json.data as T;
        }

        // API 비즈니스 에러 (2xx 응답이지만 success:false)
        throw new ApiError(
          response.status,
          json.error?.code || json.errorCode || 'UNKNOWN_ERROR',
          json.error?.message || json.message || 'Unknown error',
          json.error?.requestId || 'unknown',
        );
      } catch (error) {
        if (error instanceof ApiError) throw error;

        const axiosError = error as AxiosError<ApiResponse<T>>;
        const status = axiosError.response?.status;

        // 401 — 토큰 갱신 시도 후 1회 재요청
        if (status === 401 && attempt === 0) {
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            // 재시도
            lastError = new Error('TOKEN_REFRESHED');
            continue;
          }
          // 갱신 실패 (리프레시 토큰 만료) → 로그아웃 + 로그인 모달 오픈
          if (typeof window !== 'undefined') {
            try {
              const { useAuthStore } = require('@/stores/authStore');
              const store = useAuthStore.getState();
              store.logout();
              store.openLoginModal();
            } catch {
              // 스토어 접근 실패 시 무시
            }
          }
          throw new ApiError(401, 'UNAUTHORIZED', '인증이 만료되었습니다. 다시 로그인해주세요.', 'unknown');
        }

        // 4xx 에러 (재시도 하지 않음)
        if (status !== undefined && status >= 400 && status < 500) {
          const json = axiosError.response?.data;
          throw new ApiError(
            status,
            json?.error?.code || json?.errorCode || 'CLIENT_ERROR',
            json?.error?.message || json?.message || axiosError.message,
            json?.error?.requestId || 'unknown',
          );
        }

        // 5xx / 네트워크 / 타임아웃 에러
        lastError = error as Error;

        // 재시도 여부 판단 (Q5: 타임아웃/네트워크 에러만 — 응답이 없는 경우)
        const isRetryable = status === undefined;

        if (isRetryable && attempt < maxAttempts - 1) {
          // 지수 백오프
          const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        // 재시도 불가능하면 에러 발생
        throw new Error(
          `Failed to fetch ${path} after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
        );
      }
    }

    throw lastError || new Error(`Failed to fetch ${path}`);
  } finally {
    // 로딩 상태 항상 false로 설정
    updateLoadingState(false);
  }
}

/** 공통 타임아웃 상수 (ms) */
export const TIMEOUTS = {
  SHORT: 5_000,    // 간단한 조회 (이메일 확인, 로그아웃 등)
  DEFAULT: 10_000, // 일반 API 호출
  LONG: 60_000,    // AI 분석 (컨설팅)
} as const;

export type { ApiResponse };
export { ApiError };
