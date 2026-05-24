/**
 * useMyPage 훅 테스트 (T110)
 *
 * - 초기 로드: loadInitial 후 analyses 배열에 데이터 있음
 * - 탭 전환: setActiveTab 후 클라이언트 필터링
 * - 페이지네이션: setPage 로 페이지 이동
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

const makeSummary = (id: number, type: 'TIMING' | 'CONSULTATION' | 'COMPATIBILITY' = 'TIMING') => ({
  id,
  type,
  birthDate: '1990-05-15',
  createdAt: '2025-01-15T10:00:00Z',
  favoredPeriod: 'H1',
  confidenceScore: 82,
});

const mockMyPageResponse = (analyses: ReturnType<typeof makeSummary>[]) => ({
  profile: { id: 1, name: '홍길동', email: 'test@example.com', createdAt: '', lastLoginAt: '' },
  analyses,
  pagination: { page: 0, size: 1000, total: analyses.length, totalPages: 1 },
});

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
    const summaries = [makeSummary(1)];
    fetchMyPageData.mockResolvedValueOnce(mockMyPageResponse(summaries));

    const { result } = renderHook(() => useMyPage());

    act(() => { result.current.loadInitial('ALL'); });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.analyses).toEqual(summaries);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('loadInitial 실패 시 error 설정됨', async () => {
    fetchMyPageData.mockRejectedValueOnce(new Error('네트워크 오류'));

    const { result } = renderHook(() => useMyPage());

    act(() => { result.current.loadInitial('ALL'); });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('네트워크 오류');
    expect(result.current.analyses).toEqual([]);
  });

  it('setActiveTab 호출 시 클라이언트 필터링으로 analyses 변경됨', async () => {
    const summaries = [makeSummary(1, 'TIMING'), makeSummary(2, 'CONSULTATION')];
    fetchMyPageData.mockResolvedValueOnce(mockMyPageResponse(summaries));

    const { result } = renderHook(() => useMyPage());

    await act(async () => { result.current.loadInitial('ALL'); });
    await waitFor(() => expect(result.current.analyses).toHaveLength(2));

    act(() => { result.current.setActiveTab('TIMING'); });

    expect(result.current.analyses).toHaveLength(1);
    expect(result.current.analyses[0].type).toBe('TIMING');
    expect(result.current.activeTab).toBe('TIMING');

    // 탭 전환은 추가 API 호출 없음
    expect(fetchMyPageData).toHaveBeenCalledTimes(1);
  });

  it('setPage 호출 시 해당 페이지 슬라이스 반환됨', async () => {
    // 4개 → PAGE_SIZE=3이므로 2페이지 (3개, 1개)
    const summaries = [1, 2, 3, 4].map((id) => makeSummary(id));
    fetchMyPageData.mockResolvedValueOnce(mockMyPageResponse(summaries));

    const { result } = renderHook(() => useMyPage());

    await act(async () => { result.current.loadInitial('ALL'); });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.analyses).toHaveLength(3);
    expect(result.current.currentPage).toBe(0);
    expect(result.current.totalPages).toBe(2);

    act(() => { result.current.setPage(1); });

    expect(result.current.analyses).toHaveLength(1);
    expect(result.current.currentPage).toBe(1);
  });
});
