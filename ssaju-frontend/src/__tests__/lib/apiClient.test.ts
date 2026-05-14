/**
 * apiFetch (src/lib/api/client.ts) 테스트
 *
 * 실제 소스 동작 기준:
 * - 성공(ok + success=true): data 반환
 * - ok + success=false: ApiError throw (재시도 없음)
 * - 4xx: ApiError throw (재시도 없음)
 * - 5xx: plain Error throw (재시도 없음 — isRetryable=false)
 * - TypeError(네트워크 에러): 재시도 (isRetryable=true)
 * - AbortError(타임아웃): 재시도 (isRetryable=true)
 * - 401 attempt=0: refresh → 성공 시 continue(재시도), 실패 시 ApiError(401)
 * - loading 상태: setIsLoading(true) 시작, finally에서 setIsLoading(false)
 */

import { apiFetch, ApiError } from '@/lib/api/client';

const mockSetIsLoading = jest.fn();

jest.mock('@/stores/errorStore', () => ({
  useErrorStore: {
    getState: jest.fn(() => ({ setIsLoading: mockSetIsLoading })),
  },
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ logout: jest.fn() })),
  },
}));

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI = 'http://localhost:3000/auth/callback';

function buildOkResponse<T>(data: T) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: jest.fn().mockResolvedValue({ success: true, data, error: null, timestamp: Date.now() }),
  } as unknown as Response;
}

function buildApiErrorResponse(status: number, code = 'API_ERR', message = 'error') {
  return {
    ok: false,
    status,
    statusText: message,
    json: jest.fn().mockResolvedValue({
      success: false,
      data: null,
      error: { code, message, requestId: 'req-001' },
      timestamp: Date.now(),
    }),
  } as unknown as Response;
}

function buildServerErrorResponse(status = 500) {
  return {
    ok: false,
    status,
    statusText: 'Internal Server Error',
    json: jest.fn().mockResolvedValue({
      success: false,
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Server error', requestId: 'req-999' },
      timestamp: Date.now(),
    }),
  } as unknown as Response;
}

describe('apiFetch', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  // ─── 성공 케이스 ────────────────────────────────────────────────

  it('성공 응답(ok=true, success=true) 시 json.data 반환', async () => {
    const mockData = { sajuResultId: 'saju-001', result: '상반기 유리' };
    fetchSpy.mockResolvedValueOnce(buildOkResponse(mockData));

    const result = await apiFetch<typeof mockData>('/api/career/timing', {
      method: 'POST',
      body: { birthDate: '1990-10-10' },
      retry: { maxAttempts: 1 },
    });

    expect(result).toEqual(mockData);
  });

  it('fetch 호출 시 credentials:include, Content-Type:application/json 포함', async () => {
    fetchSpy.mockResolvedValueOnce(buildOkResponse({ ok: true }));

    await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8080/api/test',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });

  it('body 포함 시 JSON.stringify 직렬화하여 전송', async () => {
    fetchSpy.mockResolvedValueOnce(buildOkResponse({}));
    const body = { birthDate: '1990-10-10', birthTime: '14:30' };

    await apiFetch('/api/test', { method: 'POST', body, retry: { maxAttempts: 1 } });

    const callArgs = fetchSpy.mock.calls[0][1];
    expect(callArgs.body).toBe(JSON.stringify(body));
  });

  // ─── API 비즈니스 에러 ───────────────────────────────────────────

  it('ok=true + success=false 응답 시 ApiError throw', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        success: false,
        data: null,
        error: { code: 'BIZ_001', message: '비즈니스 에러', requestId: 'req-biz' },
        timestamp: Date.now(),
      }),
    } as unknown as Response);

    await expect(
      apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } }),
    ).rejects.toThrow(ApiError);
  });

  it('ApiError에 statusCode, errorCode, errorMessage 포함', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        success: false,
        data: null,
        error: { code: 'BIZ_001', message: '비즈니스 에러', requestId: 'req-biz' },
        timestamp: Date.now(),
      }),
    } as unknown as Response);

    let caughtError: ApiError | null = null;
    try {
      await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });
    } catch (e) {
      caughtError = e as ApiError;
    }

    expect(caughtError).toBeInstanceOf(ApiError);
    expect(caughtError?.errorCode).toBe('BIZ_001');
    expect(caughtError?.errorMessage).toBe('비즈니스 에러');
  });

  // ─── 4xx 에러 — 재시도 없음 ─────────────────────────────────────

  it('4xx 에러 시 재시도 없이 ApiError throw (fetch 1회만 호출)', async () => {
    fetchSpy.mockResolvedValueOnce(buildApiErrorResponse(400, 'BAD_REQUEST', '잘못된 요청'));

    await expect(
      apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 3 } }),
    ).rejects.toThrow(ApiError);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('404 에러 시 재시도 없음', async () => {
    fetchSpy.mockResolvedValueOnce(buildApiErrorResponse(404, 'NOT_FOUND', '리소스 없음'));

    await expect(
      apiFetch('/api/test', { method: 'GET', retry: { maxAttempts: 3 } }),
    ).rejects.toThrow(ApiError);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  // ─── 5xx 에러 — isRetryable=false (TypeError/AbortError만 재시도) ─

  it('5xx 에러 시 재시도 없이 즉시 에러 throw (fetch 1회 호출)', async () => {
    fetchSpy.mockResolvedValueOnce(buildServerErrorResponse(500));

    await expect(
      apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 3 } }),
    ).rejects.toThrow();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  // ─── TypeError(네트워크 에러) — 재시도 ──────────────────────────

  it('TypeError(네트워크 에러) 시 재시도 후 성공', async () => {
    jest.useFakeTimers();

    const mockData = { result: '복구 성공' };
    fetchSpy
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(buildOkResponse(mockData));

    const fetchPromise = apiFetch<typeof mockData>('/api/test', {
      method: 'POST',
      retry: { maxAttempts: 3 },
    });

    await jest.advanceTimersByTimeAsync(1000);

    const result = await fetchPromise;
    expect(result).toEqual(mockData);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  }, 10000);

  it('TypeError 3회 모두 실패 시 에러 throw (3회 호출)', async () => {
    jest.useFakeTimers();

    fetchSpy
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));

    // 에러를 미리 잡아서 unhandled rejection 방지
    let caughtError: Error | null = null;
    const fetchPromise = apiFetch('/api/test', {
      method: 'POST',
      retry: { maxAttempts: 3 },
    }).catch((e) => { caughtError = e; });

    await jest.advanceTimersByTimeAsync(1000);
    await jest.advanceTimersByTimeAsync(2000);
    await fetchPromise;

    expect(caughtError).not.toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
  }, 10000);

  it('재시도 간 지수 백오프 타이머 사용 (1s → 2s → 4s)', async () => {
    jest.useFakeTimers();

    fetchSpy
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(buildOkResponse({ ok: true }));

    const fetchPromise = apiFetch('/api/test', {
      method: 'POST',
      retry: { maxAttempts: 3 },
    });

    // 1차 백오프 (1s)
    await jest.advanceTimersByTimeAsync(1000);
    // 2차 백오프 (2s)
    await jest.advanceTimersByTimeAsync(2000);

    await expect(fetchPromise).resolves.not.toThrow();
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
  }, 10000);

  // ─── 401 — 토큰 갱신 후 재시도 ──────────────────────────────────

  it('401 응답 시 /api/auth/refresh 호출 후 원본 요청 재시도', async () => {
    const mockData = { result: '인증 후 성공' };

    fetchSpy
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({
          success: false,
          data: null,
          error: { code: 'UNAUTHORIZED', message: '인증 만료', requestId: 'req-401' },
          timestamp: Date.now(),
        }),
      } as unknown as Response)
      // refresh 요청 응답 (ok=true)
      .mockResolvedValueOnce({ ok: true } as unknown as Response)
      // 원본 요청 재시도 성공
      .mockResolvedValueOnce(buildOkResponse(mockData));

    const result = await apiFetch<typeof mockData>('/api/test', {
      method: 'POST',
      retry: { maxAttempts: 3 },
    });

    expect(result).toEqual(mockData);

    const allUrls = fetchSpy.mock.calls.map(([url]) => url as string);
    expect(allUrls.some((url) => url.includes('/api/auth/refresh'))).toBe(true);
  });

  it('401 + refresh 실패 시 ApiError(401) throw', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({
          success: false,
          data: null,
          error: { code: 'UNAUTHORIZED', message: '인증 만료', requestId: 'req-401' },
          timestamp: Date.now(),
        }),
      } as unknown as Response)
      // refresh 실패
      .mockResolvedValueOnce({ ok: false, status: 401 } as unknown as Response);

    let caughtError: ApiError | null = null;
    try {
      await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 3 } });
    } catch (e) {
      caughtError = e as ApiError;
    }

    expect(caughtError).toBeInstanceOf(ApiError);
    expect(caughtError?.statusCode).toBe(401);
  });

  // ─── 로딩 상태 ──────────────────────────────────────────────────

  it('요청 시작 시 setIsLoading(true) 호출', async () => {
    fetchSpy.mockResolvedValueOnce(buildOkResponse({ ok: true }));

    await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });

    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
  });

  it('요청 완료 후 finally에서 setIsLoading(false) 호출', async () => {
    fetchSpy.mockResolvedValueOnce(buildOkResponse({ ok: true }));

    await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });

    const calls = mockSetIsLoading.mock.calls;
    expect(calls[calls.length - 1][0]).toBe(false);
  });

  it('4xx 에러 발생 시에도 finally에서 setIsLoading(false) 호출', async () => {
    fetchSpy.mockResolvedValueOnce(buildApiErrorResponse(400));

    try {
      await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });
    } catch {
      // 에러 무시
    }

    const calls = mockSetIsLoading.mock.calls;
    expect(calls[calls.length - 1][0]).toBe(false);
  });

  it('5xx 에러 발생 시에도 finally에서 setIsLoading(false) 호출', async () => {
    fetchSpy.mockResolvedValueOnce(buildServerErrorResponse(500));

    try {
      await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });
    } catch {
      // 에러 무시
    }

    const calls = mockSetIsLoading.mock.calls;
    expect(calls[calls.length - 1][0]).toBe(false);
  });
});
