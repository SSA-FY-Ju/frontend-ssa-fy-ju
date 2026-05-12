'use client';

import { useState } from 'react';
import { LoginModal } from './LoginModal';
import { useAuth } from '@/hooks/useAuth';

/**
 * 비로그인 사용자 로그인 유도 카드
 *
 * 결과 페이지 하단에 표시:
 * "로그인하지 않으면 이 결과는 페이지를 나갈 때 사라집니다"
 */
export function LoginNudgeCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn, loginWithKakao, loginWithGoogle, isLoading, loginError } = useAuth();

  if (isLoggedIn) return null;

  return (
    <>
      <div className="rounded-xl border border-amber-500/30 bg-amber-900/20 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-medium text-amber-300">
              로그인하지 않으면 이 결과는 페이지를 나갈 때 사라집니다
            </p>
            <p className="mt-1 text-sm text-amber-400/70">
              로그인하면 분석 결과를 영구적으로 저장하고 언제든 다시 확인할 수 있습니다.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-400 transition-colors"
              >
                지금 로그인하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onKakaoLogin={async () => {
          await loginWithKakao();
          setIsModalOpen(false);
        }}
        onGoogleLogin={async () => {
          await loginWithGoogle();
          setIsModalOpen(false);
        }}
        isLoading={isLoading}
        error={loginError}
      />
    </>
  );
}
