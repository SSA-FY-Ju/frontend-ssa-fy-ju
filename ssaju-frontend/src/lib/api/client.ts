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

  let lastError: Error | null = null;
  const maxAttempts = retry?.maxAttempts || 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : null,
        credentials: 'include', // HttpOnly 쿠키 자동 전송
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
}

export type { ApiResponse };
export { ApiError };
