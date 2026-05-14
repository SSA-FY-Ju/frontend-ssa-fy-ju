'use client';

/**
 * 피드백 유도 카드 (마지막 섹션 도달 시 슬라이드업)
 *
 * - 마지막 섹션 도달 후 800ms 딜레이로 아래서 슬라이드업
 * - "의견 남기기" 버튼 클릭 시 FeedbackModal 오픈
 * - X 버튼으로 닫기 가능
 */

import { useState } from 'react';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

interface FeedbackPromptCardProps {
  onClose: () => void;
}

export function FeedbackPromptCard({ onClose }: FeedbackPromptCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* 슬라이드업 카드 */}
      <div
        role="complementary"
        aria-label="피드백 요청"
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-6 px-4
                   animate-slide-up"
      >
        <div
          className="bg-night-800 border border-night-700 rounded-2xl shadow-2xl
                        w-full max-w-sm px-5 py-4 flex items-center gap-4"
        >
          {/* 별 아이콘 */}
          <span className="text-star-400 text-2xl flex-shrink-0">★</span>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium leading-snug">
              이 결과에 대해 의견을 알려주세요
            </p>
            <p className="text-night-500 text-xs mt-0.5">
              소중한 피드백이 서비스 개선에 도움이 됩니다
            </p>
          </div>

          {/* 의견 남기기 버튼 */}
          <button
            onClick={() => setShowModal(true)}
            className="flex-shrink-0 bg-star-500 hover:bg-star-400 text-night-900
                       text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            의견 남기기
          </button>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex-shrink-0 text-night-600 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* 피드백 모달 */}
      {showModal && (
        <FeedbackModal
          feedbackType="CONSULTATION"
          onClose={() => {
            setShowModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
