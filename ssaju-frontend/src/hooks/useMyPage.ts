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
      const data = await fetchMyPageData({ 
        type: typeParam, 
        page: 0, 
        size: PAGE_SIZE 
      });

      // 실제 응답 구조(profile)에 맞춰 유저 정보 동기화
      if (data.profile) {
        setUser({
          userId: data.profile.id.toString(),
          name: data.profile.name,
          email: data.profile.email,
        });
      }

      // 백엔드 타입(SAJU, CAREER_FORTUNE, COMPANY_COMPATIBILITY) -> 프런트엔드 타입(CONSULTATION, TIMING, COMPATIBILITY) 변환
      const mappedAnalyses = (data.analyses || []).map(item => ({
        ...item,
        id: (item as any).analysisId || item.id, // analysisId 필드 대응
        type: (item.type === 'SAJU' ? 'CONSULTATION' : 
               item.type === 'CAREER_FORTUNE' ? 'TIMING' : 
               item.type === 'COMPANY_COMPATIBILITY' ? 'COMPATIBILITY' : item.type) as any
      }));

      setAnalyses(mappedAnalyses);
      setTotalCount(data.pagination?.total || 0);
      setHasMore(data.pagination ? data.pagination.page < data.pagination.totalPages - 1 : false);
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
      const data = await fetchMyPageData({ 
        type: typeParam, 
        page: nextPage, 
        size: PAGE_SIZE 
      });

      const mappedAnalyses = (data.analyses || []).map(item => ({
        ...item,
        id: (item as any).analysisId || item.id,
        type: (item.type === 'SAJU' ? 'CONSULTATION' : 
               item.type === 'CAREER_FORTUNE' ? 'TIMING' : 
               item.type === 'COMPANY_COMPATIBILITY' ? 'COMPATIBILITY' : item.type) as any
      }));

      setAnalyses((prev) => [...prev, ...mappedAnalyses]);
      setHasMore(data.pagination ? data.pagination.page < data.pagination.totalPages - 1 : false);
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
