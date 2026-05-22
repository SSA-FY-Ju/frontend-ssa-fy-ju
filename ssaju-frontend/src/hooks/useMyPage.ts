'use client';

/**
 * 마이페이지 분석 기록 목록 훅
 *
 * GET /api/mypage 응답 구조 기반
 * - analyses: MyPageAnalysisSummary[] 직접 반환 (변환 없음)
 * - totalCount, totalPages 노출
 * - 탭별 필터 (CONSULTATION / TIMING / COMPATIBILITY / ALL)
 */

import { useState, useCallback, useRef } from 'react';
import { fetchMyPageData } from '@/lib/api/mypage';
import { useAuthStore } from '@/stores/authStore';
import type { MyPageAnalysisSummary } from '@/types/api';

export type AnalysisTab = 'ALL' | 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';

interface UseMyPageReturn {
  analyses: MyPageAnalysisSummary[];
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

export function useMyPage(): UseMyPageReturn {
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

  const loadInitial = useCallback(async (tab: AnalysisTab) => {
    setIsLoading(true);
    setError(null);
    setAnalyses([]);
    setTotalCount(0);
    currentPageRef.current = 0;

    try {
      const typeParam = tab === 'ALL' ? undefined : (tab as 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY');
      const data = await fetchMyPageData({ type: typeParam, page: 0, size: PAGE_SIZE });

      // 유저 정보 동기화
      setUser({
        userId: data.userId.toString(),
        name: data.name,
        email: data.email,
      });

      setAnalyses(data.analyses);
      setTotalCount(data.totalCount);
      setHasMore(data.currentPage < data.totalPages - 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '기록을 불러오는 데 실패했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = currentPageRef.current + 1;

    try {
      const typeParam = activeTab === 'ALL' ? undefined : (activeTab as 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY');
      const data = await fetchMyPageData({ type: typeParam, page: nextPage, size: PAGE_SIZE });

      setAnalyses((prev) => [...prev, ...data.analyses]);
      setHasMore(data.currentPage < data.totalPages - 1);
      currentPageRef.current = nextPage;
    } catch (err) {
      const message = err instanceof Error ? err.message : '추가 기록을 불러오는 데 실패했습니다.';
      setError(message);
    } finally {
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [activeTab, hasMore]);

  const setActiveTab = useCallback(
    (tab: AnalysisTab) => {
      setActiveTabState(tab);
      loadInitial(tab);
    },
    [loadInitial],
  );

  return {
    analyses,
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
