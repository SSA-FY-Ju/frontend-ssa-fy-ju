'use client';

import { useCallback } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKakaoLogin: () => void;
  onGoogleLogin: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * 소셜 로그인 모달
 */
export function LoginModal({
  isOpen,
  onClose,
  onKakaoLogin,
  onGoogleLogin,
  isLoading = false,
  error = null,
}: LoginModalProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-night-800 p-8 shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
          aria-label="닫기"
        >
          ✕
        </button>

        <h2 id="login-modal-title" className="mb-2 text-center text-2xl font-bold text-white">
          SSAju 로그인
        </h2>
        <p className="mb-8 text-center text-sm text-gray-400">
          소셜 계정으로 간편하게 시작하세요
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-900/30 p-3 text-sm text-red-400">{error}</div>
        )}

        <div className="flex flex-col gap-3">
          {/* 카카오 로그인 */}
          <button
            onClick={onKakaoLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 rounded-xl bg-[#FEE500] px-4 py-3 font-medium text-[#3A1D1D] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-lg">💬</span>
            카카오로 계속하기
          </button>

          {/* 구글 로그인 */}
          <button
            onClick={onGoogleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 rounded-xl border border-gray-600 bg-white px-4 py-3 font-medium text-gray-800 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-lg">🔵</span>
            구글로 계속하기
          </button>
        </div>

        {isLoading && (
          <p className="mt-4 text-center text-sm text-gray-400">로그인 중...</p>
        )}
      </div>
    </div>
  );
}
