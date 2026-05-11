/**
 * 인증 상태 관리 (Zustand)
 *
 * 저장하는 정보:
 * - 로그인 여부 (isLoggedIn)
 * - 사용자 정보 (userId, name, profileImage 등)
 * - 소셜 제공자 (KAKAO, GOOGLE)
 *
 * 참고: 로그인 토큰은 HttpOnly 쿠키에만 저장 (sessionStore에 저장하지 않음)
 */

import { create } from 'zustand';

interface User {
  userId: string;
  name: string;
  profileImage?: string;
  socialProvider: 'KAKAO' | 'GOOGLE';
  email?: string;
}

interface AuthStore {
  // State
  isLoggedIn: boolean;
  user: User | null;
  loginError: string | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setLoginError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  isLoggedIn: false,
  user: null,
  loginError: null,
  isLoading: false,

  // Actions
  setUser: (user: User) => {
    set({
      user,
      isLoggedIn: true,
      loginError: null,
    });
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
    set({
      isLoggedIn: false,
      user: null,
      loginError: null,
    });
  },

  reset: () => {
    set({
      isLoggedIn: false,
      user: null,
      loginError: null,
      isLoading: false,
    });
  },
}));
