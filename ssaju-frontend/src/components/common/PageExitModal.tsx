'use client';

import { useAuthStore } from '@/stores/authStore';
import { BaseModal } from '@/components/common/BaseModal';

interface PageExitModalProps {
  isOpen: boolean;
  onConfirmExit: () => void;
  onCancelExit: () => void;
  onLoginAndStay: () => void;
}

export function PageExitModal({
  isOpen,
  onConfirmExit,
  onCancelExit,
  onLoginAndStay,
}: PageExitModalProps) {
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  if (!isOpen) return null;

  const handleLoginAndStay = () => {
    openLoginModal();
    onLoginAndStay();
  };

  return (
    <BaseModal
      accentBar="red"
      maxWidth={384}
      outerClassName="flex items-center justify-center p-4"
      backdropStyle={{
        background: 'rgba(4,2,18,0.78)',
      }}
      containerStyle={{
        background: 'linear-gradient(150deg, rgba(30,20,60,0.72) 0%, rgba(15,10,35,0.78) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.7), 0 0 80px rgba(239,68,68,0.08)',
      }}
    >

        <div className="relative p-7">
          {/* 배경 장식 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)' }}
            />
            <div
              className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.5) 0%, transparent 70%)' }}
            />
            <div className="absolute top-5 left-7 text-red-400/15 text-sm">✦</div>
            <div className="absolute top-8 right-10 text-orange-400/10 text-xs">★</div>
          </div>

          {/* 아이콘 영역 */}
          <div className="relative flex flex-col items-center gap-4 mb-7">
            {/* 경고 아이콘 */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full opacity-40 blur-md"
                style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.8) 0%, transparent 70%)', transform: 'scale(1.4)' }}
              />
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(251,146,60,0.1) 100%)',
                  border: '1px solid rgba(239,68,68,0.35)',
                }}
              >
                🚀
              </div>
            </div>

            {/* 텍스트 */}
            <div className="text-center">
              <h2
                id="exit-modal-title"
                className="text-white font-bold text-xl mb-2"
              >
                잠깐, 결과가 사라져요!
              </h2>
              <p id="exit-modal-desc" className="text-slate-400 text-sm leading-relaxed">
                지금 나가면 분석 결과가 사라져요.
                <br />
                <span className="text-violet-300">로그인</span>하면 영구히 저장할 수 있어요.
              </p>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="relative flex flex-col gap-2.5">
            {/* 로그인 저장 — Primary */}
            <button
              type="button"
              onClick={handleLoginAndStay}
              className="w-full py-4 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(90deg, #6d28d9 0%, #2563eb 100%)',
                color: '#fff',
                boxShadow: '0 4px 24px rgba(109,40,217,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
                letterSpacing: '0.01em',
              }}
            >
              ✦ 로그인하고 결과 저장
            </button>

            {/* 계속 보기 — Secondary */}
            <button
              type="button"
              onClick={onCancelExit}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#cbd5e1',
              }}
            >
              결과 계속 보기
            </button>

            {/* 구분선 */}
            <div className="flex items-center gap-3 my-0.5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-slate-700 text-[11px]">또는</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* 그냥 나가기 — Ghost Danger */}
            <button
              type="button"
              onClick={onConfirmExit}
              className="w-full py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
              style={{ color: '#475569' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
            >
              결과 삭제하고 나가기
            </button>
          </div>
        </div>
    </BaseModal>
  );
}
