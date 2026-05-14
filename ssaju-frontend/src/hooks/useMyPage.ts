'use client';

/**
 * 마이페이지 분석 기록 목록 훅 (T099)
 *
 * - 탭별 기록 조회 (CAREER_TIMING / CONSULTATION / COMPATIBILITY)
 * - 무한 스크롤 지원 (loadMore)
 * - 탭 전환 시 기록 초기화 후 재조회
 */

import { useState, useCallback, useRef } from 'react';
import { fetchAnalysisHistory } from '@/lib/api/mypage';
import type { AnalysisRecord } from '@/types/api';

type AnalysisTab = 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

interface UseMyPageReturn {
  records: AnalysisRecord[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  activeTab: AnalysisTab;
  setActiveTab: (tab: AnalysisTab) => void;
  loadMore: () => void;
  loadInitial: (tab: AnalysisTab) => void;
}

const PAGE_LIMIT = 20;

export function useMyPage(): UseMyPageReturn {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTabState] = useState<AnalysisTab>('CAREER_TIMING');

  // 현재 페이지 추적 (중복 요청 방지)
  const currentPageRef = useRef(1);
  const isLoadingMoreRef = useRef(false);

  /** 첫 페이지 로드 */
  const loadInitial = useCallback(async (tab: AnalysisTab) => {
    setIsLoading(true);
    setError(null);
    setRecords([]);
    currentPageRef.current = 1;

    try {
      const response = await fetchAnalysisHistory({ type: tab, page: 1, limit: PAGE_LIMIT });
      setRecords(response.records);
      setHasMore(response.hasMore);
      currentPageRef.current = 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : '기록을 불러오는 데 실패했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 다음 페이지 로드 (무한 스크롤) */
  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = currentPageRef.current + 1;

    try {
      const response = await fetchAnalysisHistory({
        type: activeTab,
        page: nextPage,
        limit: PAGE_LIMIT,
      });
      setRecords((prev) => [...prev, ...response.records]);
      setHasMore(response.hasMore);
      currentPageRef.current = nextPage;
    } catch (err) {
      const message = err instanceof Error ? err.message : '추가 기록을 불러오는 데 실패했습니다.';
      setError(message);
    } finally {
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [activeTab, hasMore]);

  /** 탭 전환: 기록 초기화 후 첫 페이지 재로드 */
  const setActiveTab = useCallback(
    (tab: AnalysisTab) => {
      setActiveTabState(tab);
      loadInitial(tab);
    },
    [loadInitial],
  );

  return {
    records,
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
