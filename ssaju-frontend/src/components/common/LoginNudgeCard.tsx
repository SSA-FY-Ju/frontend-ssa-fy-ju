'use client';

import { useAuthStore } from '@/stores/authStore';

interface LoginNudgeCardProps {
  show: boolean;
}

export function LoginNudgeCard({ show }: LoginNudgeCardProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  if (isLoggedIn || !show) return null;

  return (
    <div role="region" aria-label="로그인 안내" className="rounded-xl bg-amber-900/40 border border-amber-500/50 p-5 flex flex-col gap-4">
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

      <button
        type="button"
        onClick={openLoginModal}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600/70 text-white font-semibold text-sm hover:bg-purple-600 transition-colors"
      >
        로그인 / 회원가입
      </button>
    </div>
  );
}
