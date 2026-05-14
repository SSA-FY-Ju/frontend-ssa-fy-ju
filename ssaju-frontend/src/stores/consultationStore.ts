/**
 * AI 컨설팅 데이터 캐시 스토어 (Zustand)
 *
 * 관리하는 정보:
 * - consultation: 8섹션 전체 데이터 메모리 저장 (persist 없음, FR-022)
 * - lastFetchedId: 캐시 유효성 검증용 (sajuResultId)
 *
 * 특징:
 * - 단일 API 호출로 전체 데이터 수신 (lazy-load 없음)
 * - 메모리 전용 캐시 (localStorage/sessionStorage 미사용)
 * - 페이지 새로고침 시 초기화 → 재진입 시 API 재호출
 */

import { create } from 'zustand';
import type { ConsultationData } from '@/types/api';

export type { ConsultationData } from '@/types/api';

interface ConsultationStore {
  // State
  consultation: ConsultationData | null;
  lastFetchedId: string | null;
  isLoading: boolean;
  error: string | null;
  currentSectionIndex: number; // fullpage.js 현재 섹션 (0-based)

  // Actions
  setConsultation: (data: ConsultationData, sajuResultId: string) => void;
  clearData: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentSectionIndex: (index: number) => void;

  // 캐시 유효성 검증
  isValid: (sajuResultId: string) => boolean;
  reset: () => void;
}

const initialState = {
  consultation: null,
  lastFetchedId: null,
  isLoading: false,
  error: null,
  currentSectionIndex: 0,
};

export const useConsultationStore = create<ConsultationStore>()((set, get) => ({
  ...initialState,

  setConsultation: (data: ConsultationData, sajuResultId: string) => {
    set({
      consultation: data,
      lastFetchedId: sajuResultId,
      isLoading: false,
      error: null,
    });
  },

  clearData: () => {
    set({ ...initialState });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setCurrentSectionIndex: (index: number) => {
    set({ currentSectionIndex: index });
  },

  isValid: (sajuResultId: string) => {
    return get().lastFetchedId === sajuResultId && get().consultation !== null;
  },

  reset: () => {
    set(initialState);
  },
}));
