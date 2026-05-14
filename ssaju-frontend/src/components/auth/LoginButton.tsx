'use client';

import { LoginModal } from './LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

/**
 * 헤더 로그인 버튼
 *
 * 클릭 시 LoginModal 오픈 (authStore.isLoginModalOpen으로 전역 제어 가능)
 */
export function LoginButton() {
  const isModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);
  const { loginWithKakao, loginWithGoogle, isLoading, loginError } = useAuth();

  const handleKakaoLogin = async () => {
    await loginWithKakao();
    closeLoginModal();
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    closeLoginModal();
  };

  return (
    <>
      <button
        onClick={openLoginModal}
        className="rounded-lg border border-star-500 px-4 py-2 text-sm font-medium text-star-500 transition-colors hover:bg-star-500 hover:text-night-900"
      >
        로그인
      </button>

      <LoginModal
        isOpen={isModalOpen}
        onClose={closeLoginModal}
        onKakaoLogin={handleKakaoLogin}
        onGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
        error={loginError}
      />
    </>
  );
}
