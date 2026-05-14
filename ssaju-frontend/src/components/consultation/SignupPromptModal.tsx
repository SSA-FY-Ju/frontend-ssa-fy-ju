'use client';

/**
 * 마지막 섹션 도달 시 회원가입 유도 모달
 *
 * - 비로그인 사용자가 마지막 섹션(월별운세)에 처음 도달할 때 표시
 * - 카카오/구글 소셜 로그인 버튼 제공
 * - 닫기 버튼으로 모달 닫기 가능
 */

interface SignupPromptModalProps {
  onKakao: () => void;
  onGoogle: () => void;
  onClose: () => void;
}

export function SignupPromptModal({ onKakao, onGoogle, onClose }: SignupPromptModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/80 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-night-800 border border-night-700 rounded-2xl p-8 max-w-sm w-full shadow-xl">
        {/* 아이콘 */}
        <div className="text-center mb-6">
          <span className="text-4xl">✨</span>
        </div>

        {/* 제목 */}
        <h2
          id="signup-modal-title"
          className="text-star-400 text-xl font-bold text-center mb-2"
        >
          분석이 모두 완료됐어요!
        </h2>

        {/* 설명 */}
        <p className="text-night-300 text-sm text-center leading-relaxed mb-8">
          회원가입하면 분석 결과를 저장하고
          <br />
          언제든지 다시 확인할 수 있어요.
        </p>

        {/* 로그인 버튼들 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onKakao}
            className="w-full bg-[#FEE500] hover:bg-[#F0D800] text-[#191919] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-lg">💬</span>
            카카오로 계속하기
          </button>

          <button
            onClick={onGoogle}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-200"
          >
            <span className="text-lg">G</span>
            구글로 계속하기
          </button>

          <button
            onClick={onClose}
            className="w-full text-night-400 hover:text-night-300 text-sm py-2 transition-colors"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
