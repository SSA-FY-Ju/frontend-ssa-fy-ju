/**
 * 마이페이지 목록 캐시 스토어 (Zustand)
 *
 * - 페이지 이동 후 돌아와도 API 재호출 없이 즉시 렌더
 * - CACHE_TTL(5분) 초과 시 자동 무효화
 * - 삭제 후 invalidate() 호출로 강제 무효화
 */

import { create } from 'zustand';
import type { MyPageAnalysisSummary } from '@/types/api';

const CACHE_TTL = 5 * 60 * 1000; // 5분

interface MyPageStore {
  allAnalyses: MyPageAnalysisSummary[];
  lastFetchedAt: number | null;

  setData: (analyses: MyPageAnalysisSummary[]) => void;
  invalidate: () => void;
  isStale: () => boolean;
}

export const useMyPageStore = create<MyPageStore>((set, get) => ({
  allAnalyses: [],
  lastFetchedAt: null,

  setData: (analyses) =>
    set({ allAnalyses: analyses, lastFetchedAt: Date.now() }),

  invalidate: () =>
    set({ allAnalyses: [], lastFetchedAt: null }),

  isStale: () => {
    const { lastFetchedAt } = get();
    if (!lastFetchedAt) return true;
    return Date.now() - lastFetchedAt > CACHE_TTL;
  },
}));
