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
  /** refresh 완료(성공/실패) 후 true → 이 플래그가 true일 때만 API 호출 허용 */
  isAuthReady: boolean;
  loginError: string | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setLoginError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setIsAuthReady: (ready: boolean) => void;
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
      isAuthReady: false,
      loginError: null,
      isLoading: false,
      isLoginModalOpen: false,

      setUser: (user: User | null) => {
        set({ user, isLoggedIn: !!user, loginError: null });
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

      setIsAuthReady: (ready: boolean) => {
        set({ isAuthReady: ready });
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
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // accessToken은 보안상 localStorage에 저장하지 않음 (새로고침 시 null)
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
