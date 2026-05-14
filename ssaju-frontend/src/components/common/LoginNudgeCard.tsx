'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';

interface LoginNudgeCardProps {
  show: boolean;
}

export function LoginNudgeCard({ show }: LoginNudgeCardProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const { loginWithKakao, loginWithGoogle } = useAuth();

  if (isLoggedIn || !show) return null;

  return (
    <div className="rounded-xl bg-amber-900/40 border border-amber-500/50 p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-amber-300 font-semibold text-sm">
          ⚠ 결과가 저장되지 않습니다
        </p>
        <p className="text-amber-100/80 text-sm leading-relaxed">
          로그인하지 않으면 이 결과는 페이지를 나갈 때 사라집니다.
          <br />
          로그인하면 분석 기록이 마이페이지에 영구 저장됩니다.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => {
            openLoginModal();
            void loginWithKakao();
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FEE500] text-[#3A1D1D] font-semibold text-sm hover:bg-[#F5DC00] transition-colors"
        >
          <span>💬</span>
          카카오로 로그인
        </button>

        <button
          type="button"
          onClick={() => {
            openLoginModal();
            void loginWithGoogle();
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <span>G</span>
          구글로 로그인
        </button>
      </div>
    </div>
  );
}
