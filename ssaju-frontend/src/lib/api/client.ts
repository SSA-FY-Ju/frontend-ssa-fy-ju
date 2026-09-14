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

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
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

/**
 * 토큰 갱신 잠금 변수 (중복 갱신 방지)
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * 마지막으로 refresh 가 2xx 로 성공한 시각(ms).
 *
 * accessToken 은 HttpOnly 쿠키라 JS 가 값을 읽을 수 없다. 그래서 갱신이 실제로
 * 세션을 복구했는지 확인할 방법이 2xx 응답뿐인데, 2xx 는 "서버가 발급했다"는 뜻이지
 * "브라우저에 저장됐다"는 뜻이 아니다. 실제로 백엔드 쿠키 인증 전환 과도기에는
 * refresh 가 2xx 를 반환하면서도 Set-Cookie 가 빠져 세션이 복구되지 않았고,
 * 그 결과 API 호출마다 401 → 갱신 → 재시도 → 401 이 반복됐다.
 *
 * 토큰 값을 못 보는 대신 결과로 판단한다. 갱신 직후에도 401 이 계속되면 그 갱신은
 * 효과가 없었던 것이므로, 같은 갱신을 반복하지 않고 세션 만료로 처리한다.
 */
let lastRefreshSuccessAt = 0;

/** 갱신 후 이 시간(ms) 안에 온 401 은 "갱신해도 소용없었다"는 신호로 본다. */
const RECENT_REFRESH_WINDOW_MS = 3000;

/** accessToken 의 예상 만료 시각(ms)을 보관하는 localStorage 키. */
const ACCESS_TOKEN_EXPIRY_KEY = 'ssaju_access_token_expiry';

/** 만료 직전 요청이 401 이 되지 않도록 두는 안전 여유(ms). */
const EXPIRY_SAFETY_MARGIN_MS = 30_000;

/** 로그인·갱신 응답의 accessTokenExpiresIn(초)을 만료 시각으로 바꿔 저장한다. */
function rememberAccessTokenExpiry(expiresInSeconds: unknown): void {
  if (typeof window === 'undefined') return;
  if (typeof expiresInSeconds !== 'number' || !Number.isFinite(expiresInSeconds)) return;
  try {
    localStorage.setItem(ACCESS_TOKEN_EXPIRY_KEY, String(Date.now() + expiresInSeconds * 1000));
  } catch {
    // 저장 실패는 무시한다 — 없으면 갱신을 시도하는 쪽으로 동작한다.
  }
}

/** 로그아웃 등으로 세션이 끝났을 때 보관해 둔 만료 시각을 지운다. */
export function clearAccessTokenExpiry(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
  } catch {
    // 무시
  }
}

/**
 * accessToken 이 아직 살아 있다고 볼 수 있는지 판단한다.
 *
 * accessToken 은 HttpOnly 쿠키라 값을 읽을 수 없지만, 로그인·갱신 응답이 알려준
 * 유효 기간으로 만료 시각은 계산해 둘 수 있다. 이 값이 남아 있으면 앱 부팅 시
 * 굳이 갱신하지 않아도 된다. 실제로는 쿠키가 없어진 뒤일 수도 있는데, 그때는
 * 첫 API 요청이 401 을 받고 인터셉터가 갱신하므로 스스로 복구된다.
 */
export function isAccessTokenLikelyValid(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = Number(localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY));
    if (!Number.isFinite(stored) || stored === 0) return false;
    return Date.now() + EXPIRY_SAFETY_MARGIN_MS < stored;
  } catch {
    return false;
  }
}

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
      await axiosInstance.post(`${baseUrl}/api/auth/refresh`, {}, { withCredentials: true });

      // accessToken은 이제 응답의 Set-Cookie로 세팅되므로 값 자체를 파싱할 필요가 없다.
      // 요청이 2xx로 성공했다는 것 자체가 갱신 성공 신호.
      // user 정보(name, email)는 authStore localStorage에 영속되므로 별도 API 호출 불필요
      lastRefreshSuccessAt = Date.now();
      if (typeof window !== 'undefined') {
        const { useAuthStore } = require('@/stores/authStore');
        useAuthStore.getState().setIsLoggedIn(true);
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * 401 응답 자동 갱신 인터셉터
 *
 * - 401 수신 시 tryRefreshToken() 1회 시도 → 성공하면 원요청에 새 토큰을 실어 재시도
 * - /api/auth/refresh 자체가 401을 반환하는 경우는 재시도 대상에서 제외 (무한 루프 방지)
 * - 갱신 실패 시 로그아웃 + 로그인 모달 오픈
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // 로그인·갱신 응답은 새 accessToken 의 유효 기간(accessTokenExpiresIn, 초)을 알려준다.
    // 토큰 값 자체는 HttpOnly 라 볼 수 없지만, 이 값으로 만료 시각은 계산해 둘 수 있다.
    const url = response.config?.url ?? '';
    if (url.includes('/api/auth/login') || url.includes('/api/auth/refresh')) {
      const body = response.data as ApiResponse<{ accessTokenExpiresIn?: number }> | undefined;
      rememberAccessTokenExpiry(body?.data?.accessTokenExpiresIn);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalConfig = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = originalConfig?.url?.includes('/api/auth/refresh');

    if (status === 401 && originalConfig && !originalConfig._retry && !isRefreshCall) {
      originalConfig._retry = true;

      // 갱신에 성공한 직후인데 또 401 이라면, 그 갱신은 효과가 없었다는 뜻이다.
      // 다시 갱신해도 결과는 같고 API 호출 수만큼 갱신 요청만 늘어나므로,
      // 여기서 멈추고 세션 만료로 처리한다.
      const refreshDidNotHelp =
        lastRefreshSuccessAt > 0 &&
        Date.now() - lastRefreshSuccessAt < RECENT_REFRESH_WINDOW_MS;

      const refreshed = refreshDidNotHelp ? false : await tryRefreshToken();
      if (refreshed) {
        // 새 accessToken은 이미 쿠키로 세팅되어 있으므로 헤더 조작 없이 그대로 재시도
        return axiosInstance(originalConfig);
      }

      // 갱신 실패(리프레시 토큰 만료) 또는 갱신해도 401 지속 → 로그아웃 + 로그인 모달 오픈
      if (typeof window !== 'undefined') {
        try {
          const { useAuthStore } = require('@/stores/authStore');
          const store = useAuthStore.getState();
          store.logout();
          store.openLoginModal();
          clearAccessTokenExpiry();
        } catch {
          // 스토어 접근 실패 시 무시
        }
      }
    }

    return Promise.reject(error);
  },
);

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

        // 4xx 에러 (재시도 하지 않음)
        // 401은 axiosInstance의 response interceptor가 이미 갱신+재시도를 시도한 뒤이므로,
        // 여기 도달했다는 건 갱신도 실패했다는 뜻 (로그아웃/모달도 인터셉터에서 처리됨)
        if (status !== undefined && status >= 400 && status < 500) {
          const json = axiosError.response?.data;
          const message = status === 401
            ? '인증이 만료되었습니다. 다시 로그인해주세요.'
            : json?.error?.message || json?.message || axiosError.message;
          throw new ApiError(
            status,
            json?.error?.code || json?.errorCode || (status === 401 ? 'UNAUTHORIZED' : 'CLIENT_ERROR'),
            message,
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
