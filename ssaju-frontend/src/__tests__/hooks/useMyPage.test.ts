/**
 * useMyPage 훅 테스트 (T110)
 *
 * - 초기 로드: loadInitial 후 analyses 배열에 데이터 있음
 * - 탭 전환: setActiveTab 후 analyses 초기화 및 새 fetch
 * - loadMore: hasMore=true 상태에서 다음 페이지 fetch
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMyPage } from '@/hooks/useMyPage';

jest.mock('@/lib/api/mypage', () => ({
  fetchMyPageData: jest.fn(),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: { setUser: jest.Mock }) => unknown) =>
    selector({ setUser: jest.fn() }),
}));

const { fetchMyPageData } = jest.requireMock('@/lib/api/mypage');

const mockSummary = {
  id: 1,
  type: 'TIMING' as const,
  birthDate: '1990-05-15',
  createdAt: '2025-01-15T10:00:00Z',
  favoredPeriod: 'H1',
  confidenceScore: 82,
};

const mockSummary2 = { ...mockSummary, id: 2 };

const mockMyPageResponse = {
  userId: 1,
  email: 'test@example.com',
  name: '홍길동',
  analyses: [mockSummary],
  totalCount: 1,
  currentPage: 0,
  totalPages: 1,
};

describe('useMyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태: analyses 빈 배열, isLoading false', () => {
    const { result } = renderHook(() => useMyPage());

    expect(result.current.analyses).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.activeTab).toBe('ALL');
  });

  it('loadInitial 호출 후 analyses 데이터 설정됨', async () => {
    fetchMyPageData.mockResolvedValueOnce(mockMyPageResponse);

    const { result } = renderHook(() => useMyPage());

    act(() => {
      result.current.loadInitial('ALL');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.analyses).toEqual([mockSummary]);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loadInitial 실패 시 error 설정됨', async () => {
    fetchMyPageData.mockRejectedValueOnce(new Error('네트워크 오류'));

    const { result } = renderHook(() => useMyPage());

    act(() => {
      result.current.loadInitial('ALL');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('네트워크 오류');
    expect(result.current.analyses).toEqual([]);
  });

  it('setActiveTab 호출 시 analyses 초기화 및 새 fetch 실행', async () => {
    fetchMyPageData.mockResolvedValueOnce(mockMyPageResponse);

    const { result } = renderHook(() => useMyPage());

    await act(async () => {
      result.current.loadInitial('ALL');
    });

    await waitFor(() => expect(result.current.analyses).toHaveLength(1));

    const consultationResponse = {
      ...mockMyPageResponse,
      analyses: [mockSummary2],
    };
    fetchMyPageData.mockResolvedValueOnce(consultationResponse);

    act(() => {
      result.current.setActiveTab('CONSULTATION');
    });

    // 탭 전환 직후 analyses 초기화
    expect(result.current.analyses).toEqual([]);

    await waitFor(() => expect(result.current.analyses).toEqual([mockSummary2]));
    expect(result.current.activeTab).toBe('CONSULTATION');
  });

  it('loadMore: hasMore=true 상태에서 다음 페이지 fetch', async () => {
    const page1Response = {
      ...mockMyPageResponse,
      analyses: [mockSummary],
      totalCount: 2,
      currentPage: 0,
      totalPages: 2,
    };
    const page2Response = {
      ...mockMyPageResponse,
      analyses: [mockSummary2],
      totalCount: 2,
      currentPage: 1,
      totalPages: 2,
    };

    fetchMyPageData
      .mockResolvedValueOnce(page1Response)
      .mockResolvedValueOnce(page2Response);

    const { result } = renderHook(() => useMyPage());

    await act(async () => {
      result.current.loadInitial('ALL');
    });

    await waitFor(() => expect(result.current.analyses).toHaveLength(1));
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.analyses).toHaveLength(2));
    expect(result.current.hasMore).toBe(false);
  });

  it('hasMore=false 상태에서 loadMore 호출 시 fetch 안 함', async () => {
    fetchMyPageData.mockResolvedValueOnce(mockMyPageResponse);

    const { result } = renderHook(() => useMyPage());

    await act(async () => {
      result.current.loadInitial('ALL');
    });

    await waitFor(() => expect(result.current.hasMore).toBe(false));

    act(() => {
      result.current.loadMore();
    });

    // 한 번만 호출 (loadInitial)
    expect(fetchMyPageData).toHaveBeenCalledTimes(1);
  });
});
