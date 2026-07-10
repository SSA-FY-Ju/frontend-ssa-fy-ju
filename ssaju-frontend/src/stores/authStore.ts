/**
 * 인증 상태 관리 (Zustand)
 *
 * 저장하는 정보:
 * - 로그인 여부 (isLoggedIn)
 * - 사용자 정보 (userId, name, email)
 *
 * accessToken은 이 스토어가 아닌 HttpOnly accessToken 쿠키에만 존재한다.
 * 브라우저가 요청마다 자동으로 실어주므로 클라이언트 상태로 들고 있을 필요가 없다.
 *
 * 영속화: isLoggedIn + user → localStorage (새로고침 후에도 UI 상태 유지)
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

  // 비영속 상태
  _hasHydrated: boolean;
  /** refresh 완료(성공/실패) 후 true → 이 플래그가 true일 때만 API 호출 허용 */
  isAuthReady: boolean;
  loginError: string | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;

  // Actions
  setUser: (user: User | null) => void;
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
      _hasHydrated: false,
      isAuthReady: false,
      loginError: null,
      isLoading: false,
      isLoginModalOpen: false,

      setUser: (user: User | null) => {
        set({ user, isLoggedIn: !!user, loginError: null });
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
        set({ isLoggedIn: false, user: null, loginError: null });
      },

      reset: () => {
        set({
          isLoggedIn: false,
          user: null,
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
