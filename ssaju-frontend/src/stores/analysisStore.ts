// 파일 크기 예외: careerTiming·compatibility 두 도메인의 상태를 한 스토어에
// 관리하여 reset() 단일 호출로 전체 초기화 가능. 분리 시 reset 동기화 복잡도 증가
/**
 * 분석 데이터 캐싱 (Zustand) - 비로그인 유저용 휘발성 메모리
 *
 * 관리하는 정보:
 * - careerTiming: 관운 분석 결과 + 입력값 + 로딩/에러
 * - compatibility: 기업 궁합 결과 + 입력값 + 로딩/에러
 *
 * 특징:
 * - 메모리에만 저장 (sessionStorage X)
 * - 페이지 새로고침 시 사라짐 (의도적)
 * - 로그인 시 자동 저장 후 초기화
 */

import { create } from 'zustand';

interface AnalysisData<T> {
  inputs: Record<string, unknown> | null;
  result: T | null;
  loading: boolean;
  error: string | null;
}

interface AnalysisStore {
  // State
  careerTiming: AnalysisData<Record<string, unknown>>;
  compatibility: AnalysisData<Record<string, unknown>>;

  // Actions - Career Timing
  setCareerTimingLoading: (loading: boolean) => void;
  setCareerTimingResult: (result: Record<string, unknown> | null) => void;
  setCareerTimingError: (error: string | null) => void;
  setCareerTimingInputs: (inputs: Record<string, unknown> | null) => void;

  // Actions - Compatibility
  setCompatibilityLoading: (loading: boolean) => void;
  setCompatibilityResult: (result: Record<string, unknown> | null) => void;
  setCompatibilityError: (error: string | null) => void;
  setCompatibilityInputs: (inputs: Record<string, unknown> | null) => void;

  // Actions - Reset
  reset: () => void;
}

const initialAnalysisData: AnalysisData<Record<string, unknown>> = {
  inputs: null,
  result: null,
  loading: false,
  error: null,
};

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  // Initial state
  careerTiming: initialAnalysisData,
  compatibility: initialAnalysisData,

  // Career Timing Actions
  setCareerTimingLoading: (loading: boolean) => {
    set((state) => ({
      careerTiming: {
        ...state.careerTiming,
        loading,
      },
    }));
  },

  setCareerTimingResult: (result: Record<string, unknown> | null) => {
    set((state) => ({
      careerTiming: {
        ...state.careerTiming,
        result,
        error: null,
      },
    }));
  },

  setCareerTimingError: (error: string | null) => {
    set((state) => ({
      careerTiming: {
        ...state.careerTiming,
        error,
        loading: false,
      },
    }));
  },

  setCareerTimingInputs: (inputs: Record<string, unknown> | null) => {
    set((state) => ({
      careerTiming: {
        ...state.careerTiming,
        inputs,
      },
    }));
  },

  // Compatibility Actions
  setCompatibilityLoading: (loading: boolean) => {
    set((state) => ({
      compatibility: {
        ...state.compatibility,
        loading,
      },
    }));
  },

  setCompatibilityResult: (result: Record<string, unknown> | null) => {
    set((state) => ({
      compatibility: {
        ...state.compatibility,
        result,
        error: null,
      },
    }));
  },

  setCompatibilityError: (error: string | null) => {
    set((state) => ({
      compatibility: {
        ...state.compatibility,
        error,
        loading: false,
      },
    }));
  },

  setCompatibilityInputs: (inputs: Record<string, unknown> | null) => {
    set((state) => ({
      compatibility: {
        ...state.compatibility,
        inputs,
      },
    }));
  },

  // Reset
  reset: () => {
    set({
      careerTiming: initialAnalysisData,
      compatibility: initialAnalysisData,
    });
  },
}));
