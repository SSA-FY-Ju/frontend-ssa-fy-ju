/**
 * 인증 상태 관리 (Zustand)
 *
 * 저장하는 정보:
 * - 로그인 여부 (isLoggedIn)
 * - 사용자 정보 (userId, name, email)
 * - JWT accessToken
 *
 * 영속화: isLoggedIn + user → localStorage (새로고침 후에도 UI 상태 유지)
 * 비영속(메모리): accessToken → XSS 방어를 위해 localStorage 저장 안 함
 *   → 새로고침 시 accessToken=null, 첫 API 호출에서 401 → tryRefreshToken() 자동 재발급
 * 비영속: loginError, isLoading, isLoginModalOpen, _hasHydrated → 세션 메모리만
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  userId: string;
  email: string;
  name: string;
  profileImage?: string;
}

interface AuthStore {
  // 영속 상태
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;

  // 비영속 상태
  _hasHydrated: boolean;
  loginError: string | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;

  // Actions
  setUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setLoginError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
  reset: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // 초기 상태
      isLoggedIn: false,
      user: null,
      accessToken: null,
      _hasHydrated: false,
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

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
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
    }),
    {
      name: 'ssaju-auth',
      storage: createJSONStorage(() => localStorage),
      // localStorage에 저장할 필드만 선택 — accessToken은 XSS 방어를 위해 메모리에만 유지
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
