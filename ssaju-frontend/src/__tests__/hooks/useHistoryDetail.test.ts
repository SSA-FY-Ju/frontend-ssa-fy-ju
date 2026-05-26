/**
 * useHistoryDetail 훅 테스트
 *
 * React Query useQuery 기반으로 recordId, type을 훅 인자로 전달
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useHistoryDetail } from '@/hooks/useHistoryDetail';

jest.mock('@/lib/api/mypage', () => ({
  fetchAnalysisRecord: jest.fn(),
}));

const { fetchAnalysisRecord } = jest.requireMock('@/lib/api/mypage');

const mockRecord = {
  id: 1,
  type: 'TIMING' as const,
  birthDate: '1990-05-15',
  createdAt: '2025-01-15T10:00:00Z',
  favoredPeriod: 'H1',
  confidenceScore: 82,
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
}

describe('useHistoryDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('초기 상태: record null, isLoading true (fetch 시작)', () => {
    fetchAnalysisRecord.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useHistoryDetail('1', 'TIMING'), {
      wrapper: makeWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.record).toBeNull();
  });

  it('성공 후 record 설정됨', async () => {
    fetchAnalysisRecord.mockResolvedValueOnce(mockRecord);

    const { result } = renderHook(() => useHistoryDetail('1', 'TIMING'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.record).toEqual(mockRecord);
    expect(result.current.error).toBeNull();
    expect(fetchAnalysisRecord).toHaveBeenCalledWith('1', 'TIMING');
  });

  it('실패 시 error 설정됨', async () => {
    fetchAnalysisRecord.mockRejectedValueOnce(new Error('기록을 찾을 수 없습니다.'));

    const { result } = renderHook(() => useHistoryDetail('invalid-id', 'TIMING'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('기록을 찾을 수 없습니다.');
    expect(result.current.record).toBeNull();
  });

  it('recordId 없으면 fetch 실행 안 됨', () => {
    const { result } = renderHook(() => useHistoryDetail('', 'TIMING'), {
      wrapper: makeWrapper(),
    });
    expect(result.current.isLoading).toBe(false);
    expect(fetchAnalysisRecord).not.toHaveBeenCalled();
  });
});
