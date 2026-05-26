'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AuthModal } from '@/components/auth/AuthModal';
import { useSave } from '@/hooks/useSave';

interface SaveButtonProps {
  analysisType: 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';
}

/**
 * 분석 결과 저장 버튼
 *
 * 로그인 상태에 따라:
 * - 비로그인: "결과를 저장하려면 로그인해주세요" + 로그인 모달
 * - 로그인됨: "이 결과 저장하기" 버튼 (useSave 훅 경유)
 */
export function SaveButton({ analysisType }: SaveButtonProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { save, isSaving } = useSave(analysisType);

  if (isLoggedIn) {
    return (
      <button
        onClick={() => save()}
        disabled={isSaving}
        aria-busy={isSaving}
        className="rounded-xl bg-star-500 px-6 py-3 font-medium text-night-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? '저장 중...' : '이 결과 저장하기'}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-xl border border-star-500/50 px-6 py-3 text-sm text-star-400 transition-colors hover:border-star-500 hover:text-star-300"
      >
        결과를 저장하려면 로그인해주세요
      </button>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
