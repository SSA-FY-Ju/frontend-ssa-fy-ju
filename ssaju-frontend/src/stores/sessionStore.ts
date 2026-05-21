/**
 * 세션 상태 관리 (Zustand)
 *
 * 관리하는 정보:
 * - sajuResultId: 현재 분석 결과 ID (sessionStorage에 persist)
 * - lastAnalysisType: 마지막 분석 유형 (sessionStorage에 persist)
 * - currentAnalysisData: 현재 분석 데이터 (메모리만)
 * - isAnalyzing: 분석 진행 중 여부
 *
 * Q1 명확화:
 * - 로그인 토큰은 HttpOnly 쿠키에만 저장 (이 스토어에 저장 안 함)
 * - sessionStore는 분석 추적 정보만 관리
 * - persist 대상: sajuResultId, lastAnalysisType만
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SessionState {
  _hasHydrated: boolean;
  // User Input (Route Guard)
  birthDate: string | null; // YYYY-MM-DD format
  birthTime: string | null; // HH:mm format
  selectedService: string | null;
  // Analysis Tracking
  sajuResultId: string | null;
  lastAnalysisType: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY' | null;
  currentAnalysisData: Record<string, unknown> | null;
  isAnalyzing: boolean;
  // 피드백 제출 완료된 resultId 목록
  feedbackGivenIds: string[];
  // 헤더 "처음으로" 버튼 → 결과 페이지에 나가기 요청 전달용
  exitRequestPending: boolean;
}

interface SessionActions {
  setHasHydrated: (v: boolean) => void;
  // User Input
  initSession: (data: { birthDate: string; birthTime: string }) => void;
  setBirthDate: (birthDate: string | null) => void;
  setBirthTime: (birthTime: string | null) => void;
  setSelectedService: (serviceId: string) => void;
  setSajuData: (data: { birthDate: string; birthTime: string; selectedService: string }) => void;
  // Analysis Tracking
  setSajuResultId: (id: string | null) => void;
  setLastAnalysisType: (type: SessionState['lastAnalysisType']) => void;
  setCurrentAnalysisData: (data: Record<string, unknown> | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setFeedbackGiven: (resultId: string, feedbackType: string) => void;
  requestExit: () => void;
  clearExitRequest: () => void;
  clearSession: () => void;
  reset: () => void;
}

type SessionStore = SessionState & SessionActions;

const initialState: SessionState = {
  _hasHydrated: false,
  // User Input
  birthDate: null,
  birthTime: null,
  selectedService: null,
  // Analysis Tracking
  sajuResultId: null,
  lastAnalysisType: null,
  currentAnalysisData: null,
  isAnalyzing: false,
  feedbackGivenIds: [],
  exitRequestPending: false,
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...initialState,

      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),

      // User Input Actions
      initSession: (data: { birthDate: string; birthTime: string }) => {
        set({
          birthDate: data.birthDate,
          birthTime: data.birthTime,
        });
        // Also persist to sessionStorage for explicit backup
        sessionStorage.setItem('sessionData', JSON.stringify(data));
      },

      setBirthDate: (birthDate: string | null) => {
        set({ birthDate });
      },

      setBirthTime: (birthTime: string | null) => {
        set({ birthTime });
      },

      setSelectedService: (serviceId: string) => {
        set({ selectedService: serviceId });
      },

      setSajuData: (data: { birthDate: string; birthTime: string; selectedService: string }) => {
        set({
          birthDate: data.birthDate,
          birthTime: data.birthTime,
          selectedService: data.selectedService,
        });
      },

      // Analysis Tracking Actions
      setSajuResultId: (id: string | null) => {
        set({ sajuResultId: id });
      },

      setLastAnalysisType: (type: SessionState['lastAnalysisType']) => {
        set({ lastAnalysisType: type });
      },

      setCurrentAnalysisData: (data: Record<string, unknown> | null) => {
        set({ currentAnalysisData: data });
      },

      setIsAnalyzing: (isAnalyzing: boolean) => {
        set({ isAnalyzing });
      },

      requestExit: () => set({ exitRequestPending: true }),
      clearExitRequest: () => set({ exitRequestPending: false }),

      setFeedbackGiven: (resultId: string, feedbackType: string) => {
        const key = `${resultId}_${feedbackType}`;
        set((state) => ({
          feedbackGivenIds: state.feedbackGivenIds.includes(key)
            ? state.feedbackGivenIds
            : [...state.feedbackGivenIds, key],
        }));
      },

      clearSession: () => {
        set({
          birthDate: null,
          birthTime: null,
          currentAnalysisData: null,
          isAnalyzing: false,
          // sajuResultId와 lastAnalysisType은 유지 (히스토리 추적용)
        });
        sessionStorage.removeItem('sessionData');
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'ssaju-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        birthDate: state.birthDate,
        birthTime: state.birthTime,
        selectedService: state.selectedService,
        sajuResultId: state.sajuResultId,
        lastAnalysisType: state.lastAnalysisType,
        feedbackGivenIds: state.feedbackGivenIds,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
