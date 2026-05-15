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
  // User Input (Route Guard)
  birthDate: string | null; // YYYY-MM-DD format
  birthTime: string | null; // HH:mm format
  // Analysis Tracking
  sajuResultId: string | null;
  lastAnalysisType: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY' | null;
  currentAnalysisData: Record<string, unknown> | null;
  isAnalyzing: boolean;
}

interface SessionActions {
  // User Input
  initSession: (data: { birthDate: string; birthTime: string }) => void;
  setBirthDate: (birthDate: string | null) => void;
  setBirthTime: (birthTime: string | null) => void;
  // Analysis Tracking
  setSajuResultId: (id: string | null) => void;
  setLastAnalysisType: (type: SessionState['lastAnalysisType']) => void;
  setCurrentAnalysisData: (data: Record<string, unknown> | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  clearSession: () => void;
  reset: () => void;
}

type SessionStore = SessionState & SessionActions;

const initialState: SessionState = {
  // User Input
  birthDate: null,
  birthTime: null,
  // Analysis Tracking
  sajuResultId: null,
  lastAnalysisType: null,
  currentAnalysisData: null,
  isAnalyzing: false,
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...initialState,

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
      name: 'ssaju-session', // sessionStorage key
      storage: createJSONStorage(() => sessionStorage), // sessionStorage 사용 (탭 닫으면 삭제)
      // persist할 필드만 선택 (currentAnalysisData, isAnalyzing은 메모리만)
      partialize: (state) => ({
        birthDate: state.birthDate,
        birthTime: state.birthTime,
        sajuResultId: state.sajuResultId,
        lastAnalysisType: state.lastAnalysisType,
      }),
    },
  ),
);
