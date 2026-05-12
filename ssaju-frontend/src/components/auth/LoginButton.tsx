'use client';

import { useState } from 'react';
import { LoginModal } from './LoginModal';
import { useAuth } from '@/hooks/useAuth';

/**
 * 헤더 로그인 버튼
 *
 * 클릭 시 LoginModal 오픈
 */
export function LoginButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loginWithKakao, loginWithGoogle, isLoading, loginError } = useAuth();

  const handleKakaoLogin = async () => {
    await loginWithKakao();
    setIsModalOpen(false);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-lg border border-star-500 px-4 py-2 text-sm font-medium text-star-500 transition-colors hover:bg-star-500 hover:text-night-900"
      >
        로그인
      </button>

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onKakaoLogin={handleKakaoLogin}
        onGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
        error={loginError}
      />
    </>
  );
}
