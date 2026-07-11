/**
 * useMyPage 훅 테스트
 *
 * React Query useQuery 기반
 * - 자동 fetch 후 analyses 배열 설정 확인
 * - 탭 전환: 클라이언트 필터링 (추가 API 호출 없음)
 * - 페이지네이션: setPage 로 페이지 이동
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useMyPage } from '@/hooks/useMyPage';

jest.mock('@/lib/api/mypage', () => ({
  fetchMyPageData: jest.fn(),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: { setUser: jest.Mock; accessToken: string }) => unknown) =>
    selector({ setUser: jest.fn(), accessToken: 'mock-token' }),
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

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
}

describe('useMyPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('초기 상태: analyses 빈 배열, activeTab ALL', () => {
    fetchMyPageData.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useMyPage(), { wrapper: makeWrapper() });

    expect(result.current.analyses).toEqual([]);
    expect(result.current.activeTab).toBe('ALL');
  });

  it('fetch 완료 후 analyses 데이터 설정됨', async () => {
    const summaries = [makeSummary(1)];
    fetchMyPageData.mockResolvedValueOnce(mockMyPageResponse(summaries));

    const { result } = renderHook(() => useMyPage(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.analyses).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('fetch 실패 시 error 설정됨', async () => {
    fetchMyPageData.mockRejectedValueOnce(new Error('네트워크 오류'));

    const { result } = renderHook(() => useMyPage(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('네트워크 오류');
    expect(result.current.analyses).toEqual([]);
  });

  it('setActiveTab 호출 시 클라이언트 필터링 (추가 API 호출 없음)', async () => {
    const summaries = [makeSummary(1, 'TIMING'), makeSummary(2, 'CONSULTATION')];
    fetchMyPageData.mockResolvedValueOnce(mockMyPageResponse(summaries));

    const { result } = renderHook(() => useMyPage(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.analyses).toHaveLength(2));

    act(() => result.current.setActiveTab('TIMING'));

    expect(result.current.analyses).toHaveLength(1);
    expect(result.current.analyses[0].type).toBe('TIMING');
    expect(result.current.activeTab).toBe('TIMING');
    expect(fetchMyPageData).toHaveBeenCalledTimes(1);
  });

  it('setPage 호출 시 해당 페이지 슬라이스 반환됨', async () => {
    const summaries = [1, 2, 3, 4].map((id) => makeSummary(id));
    fetchMyPageData.mockResolvedValueOnce(mockMyPageResponse(summaries));

    const { result } = renderHook(() => useMyPage(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.analyses).toHaveLength(3);
    expect(result.current.totalPages).toBe(2);

    act(() => result.current.setPage(1));

    expect(result.current.analyses).toHaveLength(1);
    expect(result.current.currentPage).toBe(1);
  });
});
