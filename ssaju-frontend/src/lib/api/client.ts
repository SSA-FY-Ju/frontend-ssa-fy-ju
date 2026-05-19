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

import { config } from '../config/env';

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

interface ApiErrorResponse {
  code: string;
  message: string;
  requestId: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorResponse | null;
  timestamp: number;
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

/**
 * 토큰 갱신 시도 (백엔드가 /api/auth/refresh를 지원할 때만 동작)
 * 쿠키 기반 refresh token 전송 → 새 access token 쿠키 수신
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const baseUrl = config.apiBaseUrl;
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 인증 만료 시 클라이언트 상태 초기화
 */
function clearAuthAndRedirect(): void {
  if (typeof window === 'undefined') return;
  try {
    const { useAuthStore } = require('@/stores/authStore');
    useAuthStore.getState().logout?.();
  } catch {
    // 스토어를 사용할 수 없으면 무시
  }
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

  const baseUrl = config.apiBaseUrl;
  const url = `${baseUrl}${path}`;

  updateLoadingState(true);

  try {
    let lastError: Error | null = null;
    const maxAttempts = retry?.maxAttempts || 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // authStore에서 accessToken 읽어 Authorization 헤더 자동 주입
        let authHeader: Record<string, string> = {};
        try {
          if (typeof window !== 'undefined') {
            const { useAuthStore } = require('@/stores/authStore');
            const token = useAuthStore.getState().accessToken;
            if (token) authHeader = { Authorization: `Bearer ${token}` };
          }
        } catch {
          // 스토어 접근 실패 시 무시
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
            ...headers,
          },
          body: body ? JSON.stringify(body) : null,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 성공 응답 처리
        if (response.ok) {
          const json = (await response.json()) as ApiResponse<T>;

          if (json.success) {
            return json.data as T;
          }

          // API 비즈니스 에러
          throw new ApiError(
            response.status,
            json.error?.code || 'UNKNOWN_ERROR',
            json.error?.message || 'Unknown error',
            json.error?.requestId || 'unknown',
          );
        }

        // 401 — 토큰 갱신 시도 후 1회 재요청
        if (response.status === 401 && attempt === 0) {
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            // 재시도 (attempt 루프는 continue로 돌리지 않고 break 후 재귀 호출)
            lastError = new Error('TOKEN_REFRESHED');
            continue;
          }
          // 갱신 실패 → 로그아웃 처리
          clearAuthAndRedirect();
          throw new ApiError(401, 'UNAUTHORIZED', '인증이 만료되었습니다. 다시 로그인해주세요.', 'unknown');
        }

        // 4xx 에러 (재시도 하지 않음)
        if (response.status >= 400 && response.status < 500) {
          const json = (await response.json()) as ApiResponse<T>;
          throw new ApiError(
            response.status,
            json.error?.code || 'CLIENT_ERROR',
            json.error?.message || response.statusText,
            json.error?.requestId || 'unknown',
          );
        }

        // 5xx 에러 (재시도 가능)
        lastError = new Error(`Server error: ${response.statusText}`);
        throw lastError;
      } catch (error) {
        lastError = error as Error;

        // 재시도 여부 판단 (Q5: 타임아웃/네트워크 에러만)
        const isRetryable =
          error instanceof TypeError || // 네트워크 에러
          (error instanceof Error && error.name === 'AbortError'); // 타임아웃

        if (isRetryable && attempt < maxAttempts - 1) {
          // 지수 백오프
          const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.warn(
            `[apiFetch] Attempt ${attempt + 1} failed, retrying in ${backoffMs}ms...`,
            error,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        // 재시도 불가능하면 에러 발생
        if (lastError instanceof ApiError) {
          throw lastError;
        }

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

export type { ApiResponse };
export { ApiError };
