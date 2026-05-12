/**
 * AI 컨설팅 데이터 캐시 (Zustand)
 *
 * 관리하는 정보:
 * - consultation: 19개 필드 전체 메모리 저장
 * - lastFetchedId: 캐시 유효성 검증용 (sajuResultId)
 * - selectedTabIndex: 현재 선택된 탭 인덱스
 *
 * 특징:
 * - 8개 탭 전환 시 0.2초 보증 (전체 데이터 메모리 캐싱)
 * - lazy-load 없음 (모든 데이터 한번에 로드)
 * - persist 미들웨어로 localStorage에 입력값 저장 (탭 입력 캐시)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConsultationData } from '@/types/api';

// types/api.ts의 ConsultationData 재수출 (스토어 내부 사용)
export type { ConsultationData } from '@/types/api';

interface ConsultationStore {
  // State
  consultation: ConsultationData | null;
  lastFetchedId: string | null;
  selectedTabIndex: number;
  isLoading: boolean;
  error: string | null;

  // 탭 입력값 캐시 (localStorage에 persist)
  fieldCache: Record<string, string>;

  // Actions
  setConsultation: (data: ConsultationData, sajuResultId: string) => void;
  clearData: () => void;
  setSelectedTabIndex: (index: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 탭 입력값 캐시 액션
  setCachedField: (fieldId: string, value: string) => void;
  getCachedField: (fieldId: string) => string | undefined;
  clearFieldCache: () => void;

  // 유효성 검증
  isValid: (sajuResultId: string) => boolean;
  reset: () => void;
}

const initialState = {
  consultation: null,
  lastFetchedId: null,
  selectedTabIndex: 0,
  isLoading: false,
  error: null,
  fieldCache: {} as Record<string, string>,
};

export const useConsultationStore = create<ConsultationStore>()(
  persist(
    (set, get) => ({
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
        set({
          consultation: null,
          lastFetchedId: null,
          selectedTabIndex: 0,
          isLoading: false,
          error: null,
        });
      },

      setSelectedTabIndex: (index: number) => {
        set({ selectedTabIndex: index });
      },

      setIsLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setCachedField: (fieldId: string, value: string) => {
        set((state) => ({
          fieldCache: {
            ...state.fieldCache,
            [fieldId]: value,
          },
        }));
      },

      getCachedField: (fieldId: string) => {
        return get().fieldCache[fieldId];
      },

      clearFieldCache: () => {
        set({ fieldCache: {} });
      },

      isValid: (sajuResultId: string) => {
        return get().lastFetchedId === sajuResultId && get().consultation !== null;
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'consultation-storage', // localStorage key
      // fieldCache만 persist (전체 consultation은 메모리만)
      partialize: (state) => ({
        fieldCache: state.fieldCache,
      }),
    },
  ),
);
