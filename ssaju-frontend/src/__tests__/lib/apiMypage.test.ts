/**
 * mypage API 래퍼 테스트 (src/lib/api/mypage.ts)
 *
 * 검증:
 * - fetchAnalysisHistory: POST /api/my-page/history + 올바른 body
 * - fetchAnalysisRecord: GET /api/my-page/history/:id
 * - deleteAnalysisRecord: DELETE /api/my-page/history/:id + retry:maxAttempts:1
 */

import { fetchAnalysisHistory, fetchAnalysisRecord, deleteAnalysisRecord } from '@/lib/api/mypage';
import type { AnalysisHistoryRequest } from '@/lib/api/mypage';

jest.mock('@/lib/api/client', () => ({
  apiFetch: jest.fn(),
}));

const { apiFetch } = jest.requireMock('@/lib/api/client');

describe('fetchAnalysisHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/my-page/history 로 apiFetch 호출, body 전달', async () => {
    const mockResponse = {
      records: [],
      totalCount: 0,
      hasMore: false,
      nextPage: null,
    };
    apiFetch.mockResolvedValueOnce(mockResponse);

    const request: AnalysisHistoryRequest = {
      type: 'CAREER_TIMING',
      page: 1,
      limit: 10,
    };

    const result = await fetchAnalysisHistory(request);

    expect(apiFetch).toHaveBeenCalledWith('/api/my-page/history', {
      method: 'POST',
      body: request,
      timeout: 10000,
    });
    expect(result).toEqual(mockResponse);
  });

  it('다른 분석 타입(CONSULTATION)으로도 올바르게 호출', async () => {
    apiFetch.mockResolvedValueOnce({ records: [], totalCount: 0, hasMore: false, nextPage: null });

    const request: AnalysisHistoryRequest = {
      type: 'CONSULTATION',
      page: 2,
      limit: 5,
    };

    await fetchAnalysisHistory(request);

    expect(apiFetch).toHaveBeenCalledWith('/api/my-page/history', expect.objectContaining({
      body: request,
    }));
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('서버 오류'));

    await expect(
      fetchAnalysisHistory({ type: 'CAREER_TIMING', page: 1, limit: 10 }),
    ).rejects.toThrow('서버 오류');
  });
});

describe('fetchAnalysisRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/my-page/history/:id 로 apiFetch 호출', async () => {
    const mockRecord = {
      recordId: 'record-001',
      type: 'CAREER_TIMING',
      createdAt: '2025-01-01T00:00:00Z',
      result: {},
    };
    apiFetch.mockResolvedValueOnce(mockRecord);

    const result = await fetchAnalysisRecord('record-001');

    expect(apiFetch).toHaveBeenCalledWith('/api/my-page/history/record-001', {
      method: 'GET',
      timeout: 5000,
    });
    expect(result).toEqual(mockRecord);
  });

  it('recordId가 URL 경로에 올바르게 포함됨', async () => {
    apiFetch.mockResolvedValueOnce({});

    await fetchAnalysisRecord('abc-xyz-123');

    const [path] = apiFetch.mock.calls[0];
    expect(path).toBe('/api/my-page/history/abc-xyz-123');
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('기록 없음'));

    await expect(fetchAnalysisRecord('invalid-id')).rejects.toThrow('기록 없음');
  });
});

describe('deleteAnalysisRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('DELETE /api/my-page/history/:id 로 apiFetch 호출', async () => {
    apiFetch.mockResolvedValueOnce(undefined);

    await deleteAnalysisRecord('record-001');

    expect(apiFetch).toHaveBeenCalledWith('/api/my-page/history/record-001', {
      method: 'DELETE',
      timeout: 10000,
      retry: { maxAttempts: 1 },
    });
  });

  it('retry:maxAttempts:1 옵션 포함', async () => {
    apiFetch.mockResolvedValueOnce(undefined);

    await deleteAnalysisRecord('record-002');

    const [, options] = apiFetch.mock.calls[0];
    expect(options.retry).toEqual({ maxAttempts: 1 });
  });

  it('recordId가 URL 경로에 올바르게 포함됨', async () => {
    apiFetch.mockResolvedValueOnce(undefined);

    await deleteAnalysisRecord('target-record');

    const [path] = apiFetch.mock.calls[0];
    expect(path).toBe('/api/my-page/history/target-record');
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('삭제 실패'));

    await expect(deleteAnalysisRecord('record-001')).rejects.toThrow('삭제 실패');
  });

  it('성공 시 undefined 반환 (void)', async () => {
    apiFetch.mockResolvedValueOnce(undefined);

    const result = await deleteAnalysisRecord('record-001');

    expect(result).toBeUndefined();
  });
});
