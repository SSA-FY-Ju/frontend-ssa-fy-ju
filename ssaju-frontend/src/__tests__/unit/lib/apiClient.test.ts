/**
 * apiFetch (src/lib/api/client.ts) 테스트
 *
 * 실제 소스 동작 기준 (axios 기반):
 * - 성공(success=true): data 반환
 * - success=false: ApiError throw (재시도 없음)
 * - 4xx: ApiError throw (재시도 없음)
 * - 5xx: plain Error throw (재시도 없음 — isRetryable=false)
 * - 네트워크 에러(response 없음): 재시도 (isRetryable=true)
 * - 401 attempt=0: refresh → 성공 시 continue(재시도), 실패 시 ApiError(401)
 * - loading 상태: setIsLoading(true) 시작, finally에서 setIsLoading(false)
 */

import { apiFetch, axiosInstance, ApiError } from '@/lib/api/client';

const mockSetIsLoading = jest.fn();

jest.mock('@/stores/errorStore', () => ({
  useErrorStore: {
    getState: jest.fn(() => ({ setIsLoading: mockSetIsLoading })),
  },
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      logout: jest.fn(),
      openLoginModal: jest.fn(),
      setAccessToken: jest.fn(),
      setIsLoggedIn: jest.fn(),
      accessToken: null,
    })),
  },
}));

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI = 'http://localhost:3000/auth/callback';

function buildOkResponse<T>(data: T, status = 200) {
  return {
    status,
    data: { success: true, data, error: null, timestamp: Date.now() },
    headers: {},
  };
}

// mockRejectedValueOnce로 lazy하게 Promise.reject를 생성하기 위해
// 여기서는 reject '값'만 만들고, Promise는 호출부에서 mockRejectedValueOnce가 만들도록 함
// (즉시 Promise.reject(...)를 만들면 unhandled rejection 경고가 발생할 수 있음)
function buildApiErrorReject(status: number, code = 'API_ERR', message = 'error') {
  return {
    isAxiosError: true,
    message,
    response: {
      status,
      data: { success: false, data: null, error: { code, message, requestId: 'req-001' }, timestamp: Date.now() },
    },
  };
}

function buildServerErrorReject(status = 500) {
  return {
    isAxiosError: true,
    message: 'Server error',
    response: {
      status,
      data: { success: false, data: null, error: { code: 'SERVER_ERROR', message: 'Server error', requestId: 'req-999' }, timestamp: Date.now() },
    },
  };
}

function buildNetworkErrorReject() {
  return {
    isAxiosError: true,
    message: 'Network Error',
    code: 'ERR_NETWORK',
    response: undefined,
  };
}

describe('apiFetch', () => {
  let requestSpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    requestSpy = jest.spyOn(axiosInstance, 'request');
    postSpy = jest.spyOn(axiosInstance, 'post');
  });

  afterEach(() => {
    requestSpy.mockRestore();
    postSpy.mockRestore();
  });

  // ─── 성공 케이스 ────────────────────────────────────────────────

  it('성공 응답(success=true) 시 json.data 반환', async () => {
    const mockData = { sajuResultId: 'saju-001', result: '상반기 유리' };
    requestSpy.mockResolvedValueOnce(buildOkResponse(mockData));

    const result = await apiFetch<typeof mockData>('/api/career/timing', {
      method: 'POST',
      body: { birthDate: '1990-10-10' },
      retry: { maxAttempts: 1 },
    });

    expect(result).toEqual(mockData);
  });

  it('요청 시 withCredentials:true, Content-Type:application/json 포함', async () => {
    requestSpy.mockResolvedValueOnce(buildOkResponse({ ok: true }));

    await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/api/test'),
        withCredentials: true,
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });

  it('body 포함 시 data로 그대로 전달', async () => {
    requestSpy.mockResolvedValueOnce(buildOkResponse({}));
    const body = { birthDate: '1990-10-10', birthTime: '14:30' };

    await apiFetch('/api/test', { method: 'POST', body, retry: { maxAttempts: 1 } });

    const callArgs = requestSpy.mock.calls[0][0];
    expect(callArgs.data).toEqual(body);
  });

  // ─── API 비즈니스 에러 ───────────────────────────────────────────

  it('success=false 응답 시 ApiError throw', async () => {
    requestSpy.mockResolvedValueOnce({
      status: 200,
      data: {
        success: false,
        data: null,
        error: { code: 'BIZ_001', message: '비즈니스 에러', requestId: 'req-biz' },
        timestamp: Date.now(),
      },
    });

    await expect(
      apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } }),
    ).rejects.toThrow(ApiError);
  });

  it('ApiError에 statusCode, errorCode, errorMessage 포함', async () => {
    requestSpy.mockResolvedValueOnce({
      status: 200,
      data: {
        success: false,
        data: null,
        error: { code: 'BIZ_001', message: '비즈니스 에러', requestId: 'req-biz' },
        timestamp: Date.now(),
      },
    });

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

  it('4xx 에러 시 재시도 없이 ApiError throw (요청 1회만)', async () => {
    requestSpy.mockRejectedValueOnce(buildApiErrorReject(400, 'BAD_REQUEST', '잘못된 요청'));

    await expect(
      apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 3 } }),
    ).rejects.toThrow(ApiError);

    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it('404 에러 시 재시도 없음', async () => {
    requestSpy.mockRejectedValueOnce(buildApiErrorReject(404, 'NOT_FOUND', '리소스 없음'));

    await expect(
      apiFetch('/api/test', { method: 'GET', retry: { maxAttempts: 3 } }),
    ).rejects.toThrow(ApiError);

    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  // ─── 5xx 에러 — isRetryable=false (네트워크/타임아웃만 재시도) ───

  it('5xx 에러 시 재시도 없이 즉시 에러 throw (요청 1회)', async () => {
    requestSpy.mockRejectedValueOnce(buildServerErrorReject(500));

    await expect(
      apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 3 } }),
    ).rejects.toThrow();

    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  // ─── 네트워크 에러 — 재시도 ──────────────────────────

  it('네트워크 에러 시 재시도 후 성공', async () => {
    jest.useFakeTimers();

    const mockData = { result: '복구 성공' };
    requestSpy
      .mockRejectedValueOnce(buildNetworkErrorReject())
      .mockResolvedValueOnce(buildOkResponse(mockData));

    const fetchPromise = apiFetch<typeof mockData>('/api/test', {
      method: 'POST',
      retry: { maxAttempts: 3 },
    });

    await jest.advanceTimersByTimeAsync(1000);

    const result = await fetchPromise;
    expect(result).toEqual(mockData);
    expect(requestSpy).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  }, 10000);

  it('네트워크 에러 3회 모두 실패 시 에러 throw (3회 호출)', async () => {
    jest.useFakeTimers();

    requestSpy
      .mockRejectedValueOnce(buildNetworkErrorReject())
      .mockRejectedValueOnce(buildNetworkErrorReject())
      .mockRejectedValueOnce(buildNetworkErrorReject());

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
    expect(requestSpy).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
  }, 10000);

  it('재시도 간 지수 백오프 타이머 사용 (1s → 2s → 4s)', async () => {
    jest.useFakeTimers();

    requestSpy
      .mockRejectedValueOnce(buildNetworkErrorReject())
      .mockRejectedValueOnce(buildNetworkErrorReject())
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
    expect(requestSpy).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
  }, 10000);

  // ─── 401 — 토큰 갱신 후 재시도 ──────────────────────────────────

  // 401 재시도는 axiosInstance의 response interceptor(client.ts)에서 처리되므로,
  // axiosInstance.request를 직접 스텁하면 인터셉터 체인 자체가 우회되어 검증이 안 됨.
  // adapter 레벨에서 모킹해 실제 인터셉터가 개입하는 경로를 그대로 태운다.
  it('401 응답 시 인터셉터가 /api/auth/refresh 호출 후 원본 요청 재시도', async () => {
    requestSpy.mockRestore(); // 이 테스트만 실제 request()+interceptor 파이프라인을 태움
    const originalAdapter = axiosInstance.defaults.adapter;
    const mockData = { result: '인증 후 성공' };

    const adapterMock = jest.fn()
      // 1) 원본 요청 — 401
      .mockImplementationOnce((cfg) => Promise.reject({
        isAxiosError: true,
        config: cfg,
        response: {
          status: 401,
          data: { success: false, data: null, error: { code: 'UNAUTHORIZED', message: '인증 만료', requestId: 'req-401' }, timestamp: Date.now() },
        },
      }))
      // 2) tryRefreshToken()의 axiosInstance.post('/api/auth/refresh') 호출
      .mockImplementationOnce((cfg) => Promise.resolve({
        status: 200,
        data: { data: { accessToken: 'new-token' } },
        headers: {},
        config: cfg,
      }))
      // 3) 인터셉터가 재시도하는 원본 요청 — 성공
      .mockImplementationOnce((cfg) => Promise.resolve({
        status: 200,
        data: { success: true, data: mockData, error: null, timestamp: Date.now() },
        headers: {},
        config: cfg,
      }));

    axiosInstance.defaults.adapter = adapterMock;

    try {
      const result = await apiFetch<typeof mockData>('/api/test', {
        method: 'POST',
        retry: { maxAttempts: 3 },
      });

      expect(result).toEqual(mockData);
      expect(adapterMock).toHaveBeenCalledTimes(3);
      expect(adapterMock.mock.calls[1][0].url).toEqual(expect.stringContaining('/api/auth/refresh'));
    } finally {
      axiosInstance.defaults.adapter = originalAdapter;
      requestSpy = jest.spyOn(axiosInstance, 'request');
    }
  });

  it('401 + refresh 실패 시 ApiError(401) throw', async () => {
    requestSpy.mockRejectedValueOnce(buildApiErrorReject(401, 'UNAUTHORIZED', '인증 만료'));

    // refresh 요청 실패
    postSpy.mockRejectedValueOnce({ isAxiosError: true, response: { status: 401 } });

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
    requestSpy.mockResolvedValueOnce(buildOkResponse({ ok: true }));

    await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });

    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
  });

  it('요청 완료 후 finally에서 setIsLoading(false) 호출', async () => {
    requestSpy.mockResolvedValueOnce(buildOkResponse({ ok: true }));

    await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });

    const calls = mockSetIsLoading.mock.calls;
    expect(calls[calls.length - 1][0]).toBe(false);
  });

  it('4xx 에러 발생 시에도 finally에서 setIsLoading(false) 호출', async () => {
    requestSpy.mockRejectedValueOnce(buildApiErrorReject(400));

    try {
      await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });
    } catch {
      // 에러 무시
    }

    const calls = mockSetIsLoading.mock.calls;
    expect(calls[calls.length - 1][0]).toBe(false);
  });

  it('5xx 에러 발생 시에도 finally에서 setIsLoading(false) 호출', async () => {
    requestSpy.mockRejectedValueOnce(buildServerErrorReject(500));

    try {
      await apiFetch('/api/test', { method: 'POST', retry: { maxAttempts: 1 } });
    } catch {
      // 에러 무시
    }

    const calls = mockSetIsLoading.mock.calls;
    expect(calls[calls.length - 1][0]).toBe(false);
  });
});
