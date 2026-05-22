/**
 * mypage API 래퍼 테스트 (src/lib/api/mypage.ts)
 *
 * 검증:
 * - fetchMyPageData: GET /api/mypage?type=&page=&size=
 * - fetchAnalysisRecord: GET /api/mypage/analyses/{id}?type={type}
 * - deleteAnalysisRecord: DELETE /api/my-page/history/:id
 */

import { fetchMyPageData, fetchAnalysisRecord, deleteAnalysisRecord } from '@/lib/api/mypage';

jest.mock('@/lib/api/client', () => ({
  apiFetch: jest.fn(),
}));

const { apiFetch } = jest.requireMock('@/lib/api/client');

describe('fetchMyPageData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('파라미터 없이 GET /api/mypage 호출', async () => {
    const mockResponse = {
      userId: 1,
      email: 'test@example.com',
      name: '홍길동',
      analyses: [],
      totalCount: 0,
      currentPage: 0,
      totalPages: 1,
    };
    apiFetch.mockResolvedValueOnce(mockResponse);

    const result = await fetchMyPageData();

    expect(apiFetch).toHaveBeenCalledWith('/api/mypage', expect.objectContaining({ method: 'GET' }));
    expect(result).toEqual(mockResponse);
  });

  it('type 파라미터 포함 시 쿼리스트링에 추가됨', async () => {
    apiFetch.mockResolvedValueOnce({
      userId: 1, email: 'a@b.com', name: '홍', analyses: [], totalCount: 0, currentPage: 0, totalPages: 1,
    });

    await fetchMyPageData({ type: 'TIMING', page: 0, size: 10 });

    const [path] = apiFetch.mock.calls[0];
    expect(path).toContain('type=TIMING');
    expect(path).toContain('page=0');
    expect(path).toContain('size=10');
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('서버 오류'));

    await expect(fetchMyPageData()).rejects.toThrow('서버 오류');
  });
});

describe('fetchAnalysisRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/mypage/analyses/{id}?type={type} 로 apiFetch 호출', async () => {
    const mockRecord = {
      id: 1,
      type: 'TIMING',
      birthDate: '1990-05-15',
      createdAt: '2025-01-01T00:00:00Z',
    };
    apiFetch.mockResolvedValueOnce(mockRecord);

    const result = await fetchAnalysisRecord('1', 'TIMING');

    expect(apiFetch).toHaveBeenCalledWith('/api/mypage/analyses/1?type=TIMING', expect.objectContaining({ method: 'GET' }));
    expect(result).toEqual(mockRecord);
  });

  it('recordId와 type이 URL에 올바르게 포함됨', async () => {
    apiFetch.mockResolvedValueOnce({});

    await fetchAnalysisRecord('abc-123', 'CONSULTATION');

    const [path] = apiFetch.mock.calls[0];
    expect(path).toBe('/api/mypage/analyses/abc-123?type=CONSULTATION');
  });

  it('apiFetch 실패 시 에러 전파', async () => {
    apiFetch.mockRejectedValueOnce(new Error('기록 없음'));

    await expect(fetchAnalysisRecord('invalid-id', 'TIMING')).rejects.toThrow('기록 없음');
  });
});

describe('deleteAnalysisRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('DELETE /api/my-page/history/:id 로 apiFetch 호출', async () => {
    apiFetch.mockResolvedValueOnce(undefined);

    await deleteAnalysisRecord('record-001');

    expect(apiFetch).toHaveBeenCalledWith('/api/my-page/history/record-001', expect.objectContaining({
      method: 'DELETE',
    }));
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
