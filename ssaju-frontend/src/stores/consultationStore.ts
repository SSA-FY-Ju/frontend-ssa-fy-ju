/**
 * AI 컨설팅 데이터 캐시 스토어 (Zustand)
 *
 * 관리하는 정보:
 * - consultation: 전체 데이터 메모리 저장 (persist 없음)
 * - hasFetched: 캐시 유효성 검증
 *
 * 특징:
 * - 단일 API 호출로 전체 데이터 수신
 * - 메모리 전용 캐시 (페이지 새로고침 시 초기화 → 재진입 시 API 재호출)
 */

import { create } from 'zustand';
import type { ConsultationData } from '@/types/api';

export type { ConsultationData } from '@/types/api';

interface ConsultationStore {
  consultation: ConsultationData | null;
  hasFetched: boolean;
  isLoading: boolean;
  error: string | null;
  currentSectionIndex: number;

  setConsultation: (data: ConsultationData) => void;
  clearData: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentSectionIndex: (index: number) => void;
  reset: () => void;
}

const initialState = {
  consultation: null,
  hasFetched: false,
  isLoading: false,
  error: null,
  currentSectionIndex: 0,
};

export const useConsultationStore = create<ConsultationStore>()((set) => ({
  ...initialState,

  setConsultation: (data: ConsultationData) => {
    set({ consultation: data, hasFetched: true, isLoading: false, error: null });
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

  reset: () => {
    set(initialState);
  },
}));
