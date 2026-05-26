'use client';

/**
 * 마이페이지 분석 기록 목록 훅
 *
 * - React Query useQuery로 캐싱 (staleTime 5분 — 재방문 시 API 재호출 없음)
 * - 탭 전환·페이지네이션은 클라이언트에서 처리 (추가 API 호출 없음)
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMyPageData } from '@/lib/api/mypage';
import { useAuthStore } from '@/stores/authStore';
import type { MyPageAnalysisSummary } from '@/types/api';

export type AnalysisTab = 'ALL' | 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';

export const MYPAGE_QUERY_KEY = ['mypage'] as const;

const PAGE_SIZE = 3;

function mapType(rawType: string): 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY' {
  if (rawType === 'SAJU') return 'TIMING';
  if (rawType === 'CAREER_CONSULTATION') return 'CONSULTATION';
  if (rawType === 'COMPANY_COMPATIBILITY') return 'COMPATIBILITY';
  return rawType as 'CONSULTATION' | 'TIMING' | 'COMPATIBILITY';
}

export function useMyPage() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('ALL');
  const [currentPage, setCurrentPage] = useState(0);

  const setUser = useAuthStore((s) => s.setUser);
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: MYPAGE_QUERY_KEY,
    queryFn: async () => {
      const data = await fetchMyPageData({ page: 0, size: 1000 });

      if (data.profile) {
        setUser({
          userId: data.profile.id.toString(),
          name: data.profile.name,
          email: data.profile.email,
        });
      }

      return (data.analyses || []).map((item) => ({
        ...item,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (item as Record<string, any>).analysisId || item.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: mapType((item as Record<string, any>).type as string),
      })) as MyPageAnalysisSummary[];
    },
    enabled: !!accessToken,
  });

  const allAnalyses = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    if (activeTab === 'ALL') return allAnalyses;
    return allAnalyses.filter((a) => a.type === activeTab);
  }, [allAnalyses, activeTab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const analyses = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handleSetActiveTab = (tab: AnalysisTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  return {
    analyses,
    allAnalyses,
    totalCount: allAnalyses.length,
    isLoading,
    error: error ? (error instanceof Error ? error.message : '기록을 불러오는 데 실패했습니다.') : null,
    activeTab,
    setActiveTab: handleSetActiveTab,
    currentPage,
    totalPages,
    setPage: setCurrentPage,
    refetch,
  };
}
