'use client';

/**
 * 마이페이지 분석 기록 목록 훅
 *
 * - API는 전체(ALL) 1회만 호출
 * - 탭 전환은 클라이언트에서 필터링 (추가 API 호출 없음)
 */

import { useState, useCallback, useRef } from 'react';
import { fetchMyPageData } from '@/lib/api/mypage';
import { useAuthStore } from '@/stores/authStore';
import type { MyPageAnalysisSummary } from '@/types/api';

export type AnalysisTab = 'ALL' | 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';

interface UseMyPageReturn {
  analyses: MyPageAnalysisSummary[];
  allAnalyses: MyPageAnalysisSummary[]; // 탭 필터 전 전체 데이터 (현황 통계용)
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  activeTab: AnalysisTab;
  setActiveTab: (tab: AnalysisTab) => void;
  loadMore: () => void;
  loadInitial: (tab: AnalysisTab) => void;
}

const PAGE_SIZE = 10;

function mapType(rawType: string): 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY' {
  if (rawType === 'SAJU') return 'TIMING';
  if (rawType === 'CAREER_CONSULTATION') return 'CONSULTATION';
  if (rawType === 'COMPANY_COMPATIBILITY') return 'COMPATIBILITY';
  return rawType as 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';
}

function filterByTab(
  all: MyPageAnalysisSummary[],
  tab: AnalysisTab,
): MyPageAnalysisSummary[] {
  if (tab === 'ALL') return all;
  return all.filter((a) => a.type === tab);
}

export function useMyPage(): UseMyPageReturn {
  // 전체 데이터 (탭 필터 전 원본 — 현황 통계에 사용)
  const allAnalysesRef = useRef<MyPageAnalysisSummary[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<MyPageAnalysisSummary[]>([]);

  const [analyses, setAnalyses] = useState<MyPageAnalysisSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTabState] = useState<AnalysisTab>('ALL');

  const setUser = useAuthStore((s) => s.setUser);

  const currentPageRef = useRef(0);
  const isLoadingMoreRef = useRef(false);
  const activeTabRef = useRef<AnalysisTab>('ALL');

  const loadInitial = useCallback(
    async (tab: AnalysisTab) => {
      setIsLoading(true);
      setError(null);
      setAnalyses([]);
      setTotalCount(0);
      allAnalysesRef.current = [];
      currentPageRef.current = 0;
      activeTabRef.current = tab;

      try {
        // type 파라미터 없이 전체 조회
        const data = await fetchMyPageData({ page: 0, size: PAGE_SIZE });

        if (data.profile) {
          setUser({
            userId: data.profile.id.toString(),
            name: data.profile.name,
            email: data.profile.email,
          });
        }

        const mapped = (data.analyses || []).map((item) => ({
          ...item,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (item as Record<string, any>).analysisId || item.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: mapType((item as Record<string, any>).type as string),
        }));

        allAnalysesRef.current = mapped;
        setAllAnalyses(mapped);
        setAnalyses(filterByTab(mapped, tab));
        setTotalCount(data.pagination?.total || 0);
        setHasMore(data.pagination ? data.pagination.page < data.pagination.totalPages - 1 : false);
      } catch (err) {
        const message = err instanceof Error ? err.message : '기록을 불러오는 데 실패했습니다.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = currentPageRef.current + 1;

    try {
      const data = await fetchMyPageData({ page: nextPage, size: PAGE_SIZE });

      const mapped = (data.analyses || []).map((item) => ({
        ...item,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (item as Record<string, any>).analysisId || item.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: mapType((item as Record<string, any>).type as string),
      }));

      allAnalysesRef.current = [...allAnalysesRef.current, ...mapped];
      setAllAnalyses(allAnalysesRef.current);
      setAnalyses(filterByTab(allAnalysesRef.current, activeTabRef.current));
      setHasMore(data.pagination ? data.pagination.page < data.pagination.totalPages - 1 : false);
      currentPageRef.current = nextPage;
    } catch (err) {
      const message = err instanceof Error ? err.message : '추가 기록을 불러오는 데 실패했습니다.';
      setError(message);
    } finally {
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [hasMore]);

  const setActiveTab = useCallback(
    (tab: AnalysisTab) => {
      setActiveTabState(tab);
      activeTabRef.current = tab;
      // API 재호출 없이 기존 데이터에서 필터링
      setAnalyses(filterByTab(allAnalysesRef.current, tab));
    },
    [],
  );

  return {
    analyses,
    allAnalyses,
    totalCount,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    activeTab,
    setActiveTab,
    loadMore,
    loadInitial,
  };
}
