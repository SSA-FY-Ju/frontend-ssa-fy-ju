/**
 * 전역 에러 상태 관리 (Zustand)
 *
 * 관리하는 정보:
 * - globalError: 현재 전역 에러
 * - toastQueue: 토스트 메시지 큐
 * - apiErrors: API 에러 히스토리
 */

import { create } from 'zustand';

export interface GlobalError {
  code: string;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

interface ErrorStore {
  // State
  globalError: GlobalError | null;
  toastQueue: Toast[];
  isLoading: boolean;

  // Actions
  setGlobalError: (error: GlobalError | null) => void;
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  clearGlobalError: () => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useErrorStore = create<ErrorStore>((set) => ({
  // Initial state
  globalError: null,
  toastQueue: [],
  isLoading: false,

  // Actions
  setGlobalError: (error: GlobalError | null) => {
    set({ globalError: error });
  },

  addToast: (toast: Toast) => {
    set((state) => ({
      toastQueue: [...state.toastQueue, toast],
    }));
  },

  removeToast: (id: string) => {
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toastQueue: [] });
  },

  clearGlobalError: () => {
    set({ globalError: null });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  reset: () => {
    set({
      globalError: null,
      toastQueue: [],
      isLoading: false,
    });
  },
}));
