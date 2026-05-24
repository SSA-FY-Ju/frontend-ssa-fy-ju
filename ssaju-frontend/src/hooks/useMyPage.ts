'use client';

/**
 * 마이페이지 분석 기록 목록 훅
 *
 * - API는 전체(ALL) 1회만 호출
 * - 탭 전환은 클라이언트에서 필터링 (추가 API 호출 없음)
 * - 페이지네이션: 클라이언트에서 PAGE_SIZE 단위로 슬라이싱
 */

import { useState, useCallback, useRef } from 'react';
import { fetchMyPageData } from '@/lib/api/mypage';
import { useAuthStore } from '@/stores/authStore';
import type { MyPageAnalysisSummary } from '@/types/api';

export type AnalysisTab = 'ALL' | 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';

interface UseMyPageReturn {
  analyses: MyPageAnalysisSummary[];       // 현재 페이지에 표시할 카드
  allAnalyses: MyPageAnalysisSummary[];    // 탭 필터 전 전체 데이터 (현황 통계용)
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  activeTab: AnalysisTab;
  setActiveTab: (tab: AnalysisTab) => void;
  setPage: (page: number) => void;
  loadInitial: (tab: AnalysisTab) => void;
}

const PAGE_SIZE = 3;

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
  // 탭 필터 전 원본 전체 데이터 (현황 통계용)
  const allAnalysesRef = useRef<MyPageAnalysisSummary[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<MyPageAnalysisSummary[]>([]);

  // 현재 탭 기준 필터링된 전체 목록
  const filteredRef = useRef<MyPageAnalysisSummary[]>([]);

  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTabState] = useState<AnalysisTab>('ALL');

  // 카드 목록·현재 페이지·총 페이지를 하나의 state로 묶어 단일 setState로 동기화
  const [pageView, setPageView] = useState<{
    items: MyPageAnalysisSummary[];
    currentPage: number;
    totalPages: number;
  }>({ items: [], currentPage: 0, totalPages: 1 });

  const setUser = useAuthStore((s) => s.setUser);

  function applyPage(filtered: MyPageAnalysisSummary[], page: number) {
    const start = page * PAGE_SIZE;
    setPageView({
      items: filtered.slice(start, start + PAGE_SIZE),
      currentPage: page,
      totalPages: Math.ceil(filtered.length / PAGE_SIZE) || 1,
    });
  }

  const loadInitial = useCallback(
    async (tab: AnalysisTab) => {
      setIsLoading(true);
      setError(null);
      setPageView({ items: [], currentPage: 0, totalPages: 1 });
      setTotalCount(0);
      allAnalysesRef.current = [];
      filteredRef.current = [];

      try {
        const data = await fetchMyPageData({ page: 0, size: 1000 });

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
        setTotalCount(mapped.length);

        const filtered = filterByTab(mapped, tab);
        filteredRef.current = filtered;
        setActiveTabState(tab);
        applyPage(filtered, 0);
      } catch (err) {
        const message = err instanceof Error ? err.message : '기록을 불러오는 데 실패했습니다.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  const setActiveTab = useCallback((tab: AnalysisTab) => {
    setActiveTabState(tab);
    const filtered = filterByTab(allAnalysesRef.current, tab);
    filteredRef.current = filtered;
    applyPage(filtered, 0);
  }, []);

  const setPage = useCallback((page: number) => {
    applyPage(filteredRef.current, page);
  }, []);

  return {
    analyses: pageView.items,
    allAnalyses,
    totalCount,
    currentPage: pageView.currentPage,
    totalPages: pageView.totalPages,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    setPage,
    loadInitial,
  };
}
