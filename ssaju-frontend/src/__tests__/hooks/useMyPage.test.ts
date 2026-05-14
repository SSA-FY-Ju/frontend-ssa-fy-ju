/**
 * useMyPage 훅 테스트 (T110)
 *
 * - 초기 로드: loadInitial 후 records 배열에 데이터 있음
 * - 탭 전환: setActiveTab 후 records 초기화 및 새 fetch
 * - loadMore: hasMore=true 상태에서 다음 페이지 fetch
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMyPage } from '@/hooks/useMyPage';

jest.mock('@/lib/api/mypage', () => ({
  fetchAnalysisHistory: jest.fn(),
}));

const { fetchAnalysisHistory } = jest.requireMock('@/lib/api/mypage');

const mockRecord = {
  recordId: 'record-001',
  userId: 'user-001',
  analysisType: 'CAREER_TIMING' as const,
  data: {
    sajuResultId: 'saju-001',
    h1Period: '2025년 상반기',
    h2Period: '2026년 하반기',
    h1Confidence: 82,
    h2Confidence: 65,
    recommendation: '상반기가 유리합니다.',
  },
  createdAt: Date.now(),
};

const mockRecord2 = {
  ...mockRecord,
  recordId: 'record-002',
};

const mockHistoryResponse = {
  records: [mockRecord],
  hasMore: false,
  total: 1,
};

describe('useMyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태: records 빈 배열, isLoading false', () => {
    const { result } = renderHook(() => useMyPage());

    expect(result.current.records).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.activeTab).toBe('CAREER_TIMING');
  });

  it('loadInitial 호출 후 records 데이터 설정됨', async () => {
    fetchAnalysisHistory.mockResolvedValueOnce(mockHistoryResponse);

    const { result } = renderHook(() => useMyPage());

    act(() => {
      result.current.loadInitial('CAREER_TIMING');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.records).toEqual([mockRecord]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loadInitial 실패 시 error 설정됨', async () => {
    fetchAnalysisHistory.mockRejectedValueOnce(new Error('네트워크 오류'));

    const { result } = renderHook(() => useMyPage());

    act(() => {
      result.current.loadInitial('CAREER_TIMING');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('네트워크 오류');
    expect(result.current.records).toEqual([]);
  });

  it('setActiveTab 호출 시 records 초기화 및 새 fetch 실행', async () => {
    // 첫 번째 tab 로드
    fetchAnalysisHistory.mockResolvedValueOnce(mockHistoryResponse);

    const { result } = renderHook(() => useMyPage());

    await act(async () => {
      result.current.loadInitial('CAREER_TIMING');
    });

    await waitFor(() => expect(result.current.records).toHaveLength(1));

    // CONSULTATION 탭으로 전환
    const consultationResponse = {
      records: [mockRecord2],
      hasMore: false,
      total: 1,
    };
    fetchAnalysisHistory.mockResolvedValueOnce(consultationResponse);

    act(() => {
      result.current.setActiveTab('CONSULTATION');
    });

    // 탭 전환 직후 records 초기화
    expect(result.current.records).toEqual([]);

    await waitFor(() => expect(result.current.records).toEqual([mockRecord2]));
    expect(result.current.activeTab).toBe('CONSULTATION');
    expect(fetchAnalysisHistory).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CONSULTATION', page: 1 }),
    );
  });

  it('loadMore: hasMore=true 상태에서 다음 페이지 fetch', async () => {
    const page1Response = {
      records: [mockRecord],
      hasMore: true,
      total: 2,
    };
    const page2Response = {
      records: [mockRecord2],
      hasMore: false,
      total: 2,
    };

    fetchAnalysisHistory
      .mockResolvedValueOnce(page1Response)
      .mockResolvedValueOnce(page2Response);

    const { result } = renderHook(() => useMyPage());

    await act(async () => {
      result.current.loadInitial('CAREER_TIMING');
    });

    await waitFor(() => expect(result.current.records).toHaveLength(1));
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.records).toHaveLength(2));
    expect(result.current.hasMore).toBe(false);
    expect(fetchAnalysisHistory).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });

  it('hasMore=false 상태에서 loadMore 호출 시 fetch 안 함', async () => {
    fetchAnalysisHistory.mockResolvedValueOnce(mockHistoryResponse);

    const { result } = renderHook(() => useMyPage());

    await act(async () => {
      result.current.loadInitial('CAREER_TIMING');
    });

    await waitFor(() => expect(result.current.hasMore).toBe(false));

    act(() => {
      result.current.loadMore();
    });

    // 한 번만 호출 (loadInitial)
    expect(fetchAnalysisHistory).toHaveBeenCalledTimes(1);
  });
});
