/**
 * 인증 상태 관리 (Zustand)
 *
 * 저장하는 정보:
 * - 로그인 여부 (isLoggedIn)
 * - 사용자 정보 (userId, name, email)
 * - JWT accessToken (메모리 저장 — XSS 방지)
 */

import { create } from 'zustand';

interface User {
  userId: string;
  email: string;
  name: string;
  profileImage?: string;
}

interface AuthStore {
  // State
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  loginError: string | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;

  // Actions
  setUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setLoginError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
  reset: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  isLoggedIn: false,
  user: null,
  accessToken: null,
  loginError: null,
  isLoading: false,
  isLoginModalOpen: false,

  setUser: (user: User) => {
    set({ user, isLoggedIn: true, loginError: null });
  },

  setAccessToken: (token: string | null) => {
    set({ accessToken: token });
  },

  setIsLoggedIn: (isLoggedIn: boolean) => {
    set({ isLoggedIn });
  },

  setLoginError: (error: string | null) => {
    set({ loginError: error });
  },

  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  logout: () => {
    set({ isLoggedIn: false, user: null, accessToken: null, loginError: null });
  },

  reset: () => {
    set({
      isLoggedIn: false,
      user: null,
      accessToken: null,
      loginError: null,
      isLoading: false,
    });
  },

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}));
