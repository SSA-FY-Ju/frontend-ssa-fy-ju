'use client';

// 파일 크기 예외: 만족도 라디오·글자수 카운터·제출 버튼 등 피드백 모달의 모든
// 인터랙션이 하나의 UI 단위를 구성하여 분리 시 상태 공유가 복잡해짐
/**
 * 만족도 피드백 모달 (T093)
 *
 * - 만족도 선택 (필수): 만족함 / 만족하지 않음 라디오
 * - 피드백 유형: 페이지에 따라 자동 결정 (읽기 전용)
 * - 상세 의견: 선택 입력, 최대 500자 + 실시간 카운터
 */

import { useState } from 'react';
import { useFeedback } from '@/hooks/useFeedback';

type FeedbackType = 'CAREER_TIMING' | 'CONSULTATION' | 'COMPATIBILITY';

const FEEDBACK_TYPE_LABEL: Record<FeedbackType, string> = {
  CAREER_TIMING: '관운 분석',
  CONSULTATION: 'AI 커리어 컨설팅',
  COMPATIBILITY: '기업 궁합 분석',
};

interface FeedbackModalProps {
  feedbackType: FeedbackType;
  onClose: () => void;
}

export function FeedbackModal({ feedbackType, onClose }: FeedbackModalProps) {
  const [satisfaction, setSatisfaction] = useState<'SATISFIED' | 'UNSATISFIED' | null>(null);
  const [content, setContent] = useState('');
  const { submit, isSubmitting, error } = useFeedback(feedbackType, onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!satisfaction) return;
    submit(satisfaction, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 500자 초과 입력 자동 방지 (FR-031)
    if (e.target.value.length <= 500) {
      setContent(e.target.value);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-night-800 border border-night-700 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          aria-label="모달 닫기"
          className="absolute top-4 right-4 text-night-700 hover:text-white transition-colors text-xl"
        >
          ×
        </button>

        <h2 id="feedback-modal-title" className="text-star-400 text-lg font-bold mb-1">
          분석 결과 피드백
        </h2>
        <p className="text-night-700 text-xs mb-5">
          피드백 대상: {FEEDBACK_TYPE_LABEL[feedbackType]}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 만족도 선택 (필수) */}
          <fieldset>
            <legend className="text-white text-sm font-medium mb-2">
              만족도 <span className="text-red-400 text-xs">*필수</span>
            </legend>
            <div className="flex flex-col gap-2">
              {(['SATISFIED', 'UNSATISFIED'] as const).map((value) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    satisfaction === value
                      ? 'border-star-500 bg-night-700'
                      : 'border-night-700 hover:border-night-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="satisfaction"
                    value={value}
                    checked={satisfaction === value}
                    onChange={() => setSatisfaction(value)}
                    className="accent-star-500"
                  />
                  <span className="text-white text-sm">
                    {value === 'SATISFIED' ? '만족함' : '만족하지 않음'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 상세 의견 (선택) */}
          <div>
            <label htmlFor="feedback-content" className="block text-white text-sm font-medium mb-1">
              상세 의견 <span className="text-night-700 text-xs">(선택)</span>
            </label>
            <textarea
              id="feedback-content"
              value={content}
              onChange={handleContentChange}
              placeholder="분석 결과에 대한 의견을 자유롭게 남겨주세요"
              rows={4}
              className="w-full bg-night-900 border border-night-700 text-white text-sm rounded px-3 py-2 resize-none focus:outline-none focus:border-star-500"
            />
            {/* 실시간 글자수 카운터 (FR-031) */}
            <p className="text-right text-night-700 text-xs mt-1">
              {content.length} / 500
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p role="alert" className="text-red-400 text-sm">
              {error}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!satisfaction || isSubmitting}
            className="w-full bg-star-500 hover:bg-star-400 disabled:bg-night-700 disabled:cursor-not-allowed text-night-900 font-bold py-3 rounded transition-colors"
          >
            {isSubmitting ? '제출 중...' : '제출하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
