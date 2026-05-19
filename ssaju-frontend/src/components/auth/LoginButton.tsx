'use client';

import { AuthModal } from './AuthModal';
import { useAuthStore } from '@/stores/authStore';

/**
 * 헤더 로그인 버튼
 *
 * 클릭 시 AuthModal 오픈 (authStore.isLoginModalOpen으로 전역 제어 가능)
 */
export function LoginButton() {
  const isModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);

  return (
    <>
      <button
        onClick={openLoginModal}
        className="rounded-lg border border-star-500 px-4 py-2 text-sm font-medium text-star-500 transition-colors hover:bg-star-500 hover:text-night-900"
      >
        로그인
      </button>

      <AuthModal isOpen={isModalOpen} onClose={closeLoginModal} />
    </>
  );
}
