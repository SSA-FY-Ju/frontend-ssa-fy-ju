'use client';

/**
 * 피드백 버튼 (T095)
 *
 * 분석 결과 페이지 하단에 배치.
 * 클릭 시 FeedbackModal 오픈
 */

import { useState } from 'react';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

type FeedbackType = 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

interface FeedbackButtonProps {
  feedbackType: FeedbackType;
}

export function FeedbackButton({ feedbackType }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className="w-full border border-night-700 hover:border-star-500 text-star-300 text-sm py-2 rounded transition-colors"
      >
        이 결과에 대해 의견을 알려주세요
      </button>

      {isOpen && (
        <FeedbackModal
          feedbackType={feedbackType}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
