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

/**
 * 토큰 갱신 시도
 * refreshToken HttpOnly 쿠키 → 백엔드 → 새 accessToken 응답 → authStore 갱신
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const baseUrl = (config.apiBaseUrl || '').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      credentials: 'include',
    });
    if (!response.ok) return false;

    const json = await response.json().catch(() => ({}));
    
    // 1순위: 응답 헤더 Authorization
    const authHeader = response.headers.get('authorization') ?? '';
    let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    // 2순위: 응답 바디
    if (!token) {
      token = json.data?.accessToken ?? json.accessToken ?? '';
    }

    if (token) {
      // 새 accessToken을 authStore에 저장
      if (typeof window !== 'undefined') {
        const { useAuthStore } = require('@/stores/authStore');
        useAuthStore.getState().setAccessToken(token);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error('[tryRefreshToken] Error:', err);
    return false;
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

        if (process.env.NODE_ENV === 'development') {
          console.log(`[API →] ${method} ${url}`, body ?? '');
        }

        const response = await fetch(url, {
          method,
          credentials: 'include', // refreshToken HttpOnly 쿠키 자동 전송 (logout 등에서 필요)
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

          if (process.env.NODE_ENV === 'development') {
            console.log(`[API ←] ${method} ${url} ${response.status}`, json);
          }

          if (json.success) {
            return json.data as T;
          }

          // API 비즈니스 에러
          throw new ApiError(
            response.status,
            json.error?.code || json.errorCode || 'UNKNOWN_ERROR',
            json.error?.message || json.message || 'Unknown error',
            json.error?.requestId || 'unknown',
          );
        }

        // 401 — 토큰 갱신 시도 후 1회 재요청
        if (response.status === 401 && attempt === 0) {
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            // 재시도
            lastError = new Error('TOKEN_REFRESHED');
            continue;
          }
          // [수정] 갱신 실패 시 자동으로 모달을 띄우지 않음
          // 대신 ApiError(401)를 던져서 컴포넌트가 처리하게 함
          throw new ApiError(401, 'UNAUTHORIZED', '인증이 만료되었습니다. 다시 로그인해주세요.', 'unknown');
        }

        // 4xx 에러 (재시도 하지 않음)
        if (response.status >= 400 && response.status < 500) {
          const json = (await response.json()) as ApiResponse<T>;
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[API ←] ${method} ${url} ${response.status}`, json);
          }
          throw new ApiError(
            response.status,
            json.error?.code || json.errorCode || 'CLIENT_ERROR',
            json.error?.message || json.message || response.statusText,
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
