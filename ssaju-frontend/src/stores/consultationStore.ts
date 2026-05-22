/**
 * AI 컨설팅 데이터 스토어 (Zustand)
 *
 * 관리하는 정보:
 * - consultation: 현재 세션의 컨설팅 데이터 (캐싱 없음)
 * - isLoading / error: 요청 상태
 * - currentSectionIndex: Swiper 현재 섹션
 *
 * 특징:
 * - 캐싱 없음 — 날짜를 달리해 여러 번 분석할 수 있으므로 매 분석마다 새로 요청
 */

import { create } from 'zustand';
import type { ConsultationData } from '@/types/api';

export type { ConsultationData } from '@/types/api';

interface ConsultationStore {
  consultation: ConsultationData | null;
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
  isLoading: false,
  error: null,
  currentSectionIndex: 0,
};

export const useConsultationStore = create<ConsultationStore>()((set) => ({
  ...initialState,

  setConsultation: (data: ConsultationData) => {
    set({ consultation: data, isLoading: false, error: null });
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
