'use client';

import { useAuthStore } from '@/stores/authStore';

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
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      aria-describedby="exit-modal-desc"
    >
      <div className="bg-night-800 rounded-2xl p-6 max-w-sm w-full flex flex-col gap-5 shadow-2xl">
        <div className="flex flex-col gap-2">
          <h2
            id="exit-modal-title"
            className="text-white font-bold text-lg text-center"
          >
            잠깐! 결과가 사라집니다
          </h2>
          <p
            id="exit-modal-desc"
            className="text-night-600 text-sm text-center leading-relaxed"
          >
            지금 나가시면 분석 결과가 삭제됩니다.
            <br />
            정말 나가시겠습니까?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Primary: 로그인하고 결과 저장 */}
          <button
            type="button"
            onClick={handleLoginAndStay}
            className="w-full px-4 py-3 rounded-xl bg-star-500 text-night-900 font-semibold text-sm hover:bg-star-400 transition-colors"
          >
            지금 로그인하기
          </button>

          {/* Secondary: 계속 보기 */}
          <button
            type="button"
            onClick={onCancelExit}
            className="w-full px-4 py-3 rounded-xl bg-night-700 text-star-400 font-semibold text-sm hover:bg-night-600 transition-colors border border-night-600"
          >
            계속 보기
          </button>

          {/* Ghost/Danger: 그냥 나가기 */}
          <button
            type="button"
            onClick={onConfirmExit}
            className="w-full px-4 py-3 rounded-xl text-red-400/70 text-sm hover:text-red-300 transition-colors"
          >
            그냥 나가기
          </button>
        </div>
      </div>
    </div>
  );
}
