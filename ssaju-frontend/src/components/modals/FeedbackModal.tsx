'use client';

import { useEffect, useState } from 'react';
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
  /** 피드백 제출 성공 시 추가로 호출되는 콜백 */
  onSubmitted?: () => void;
  /** 제공 시 하단에 "그냥 나가기" 버튼을 표시 */
  exitAction?: { onExit: () => void };
}

const OPTIONS = [
  {
    value: 'SATISFIED' as const,
    emoji: '🌟',
    label: '도움이 됐어요',
    sub: '분석이 유용했어요',
    activeStyle: {
      background: 'linear-gradient(135deg, rgba(250,204,21,0.18) 0%, rgba(234,179,8,0.1) 100%)',
      border: '1.5px solid rgba(250,204,21,0.55)',
      boxShadow: '0 0 20px rgba(250,204,21,0.15)',
    },
    inactiveStyle: {
      background: 'rgba(255,255,255,0.03)',
      border: '1.5px solid rgba(255,255,255,0.08)',
    },
    activeColor: '#fde047',
    inactiveColor: '#475569',
  },
  {
    value: 'DISSATISFIED' as const,
    emoji: '💫',
    label: '아쉬웠어요',
    sub: '개선이 필요해요',
    activeStyle: {
      background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(99,102,241,0.12) 100%)',
      border: '1.5px solid rgba(139,92,246,0.55)',
      boxShadow: '0 0 20px rgba(139,92,246,0.15)',
    },
    inactiveStyle: {
      background: 'rgba(255,255,255,0.03)',
      border: '1.5px solid rgba(255,255,255,0.08)',
    },
    activeColor: '#a78bfa',
    inactiveColor: '#475569',
  },
];

export function FeedbackModal({ feedbackType, onClose, onSubmitted, exitAction }: FeedbackModalProps) {
  const [satisfaction, setSatisfaction] = useState<'SATISFIED' | 'DISSATISFIED' | null>(null);
  const [content, setContent] = useState('');
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // 열릴 때 마운트 → 다음 프레임에서 visible=true (슬라이드업 트리거)
  useEffect(() => {
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const { submit, isSubmitting, error } = useFeedback(feedbackType, () => {
    onSubmitted?.();
    handleClose();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!satisfaction) return;
    submit(satisfaction, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 500) setContent(e.target.value);
  };

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{
        background: 'rgba(4,2,18,0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transition: 'opacity 0.28s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* 닫기 배경 */}
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      <div
        className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-3xl overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(30,15,60,0.92) 0%, rgba(5,8,20,0.95) 70%)',
          border: '1px solid rgba(139,92,246,0.2)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(109,40,217,0.12)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
          opacity: visible ? 1 : 0,
        }}
      >
        {/* 배경 별빛 장식 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-6 left-8 text-violet-400/20 text-xs">✦</div>
          <div className="absolute top-12 right-12 text-violet-400/15 text-[10px]">★</div>
          <div className="absolute top-4 right-6 text-blue-400/20 text-[8px]">✦</div>
          <div className="absolute bottom-24 left-6 text-violet-400/10 text-xs">★</div>
          <div className="absolute bottom-16 right-8 text-blue-400/15 text-[10px]">✦</div>
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.6) 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative p-6 pt-7">
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            aria-label="모달 닫기"
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 text-slate-500 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            ×
          </button>

          {/* 헤더 */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-px flex-1"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4))' }}
              />
              <span className="text-violet-400 text-[11px] tracking-widest font-medium">
                {FEEDBACK_TYPE_LABEL[feedbackType]}
              </span>
              <div
                className="h-px flex-1"
                style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.4), transparent)' }}
              />
            </div>
            <h2
              id="feedback-modal-title"
              className="text-white text-xl font-bold text-center"
            >
              분석이 도움이 됐나요?
            </h2>
            <p className="text-slate-500 text-xs text-center mt-1.5">
              솔직한 피드백이 서비스 개선에 큰 힘이 돼요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 만족도 선택 */}
            <fieldset>
              <legend className="sr-only">만족도</legend>
              <div className="grid grid-cols-2 gap-3">
                {OPTIONS.map((opt) => {
                  const selected = satisfaction === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSatisfaction(opt.value)}
                      className="flex flex-col items-center gap-2.5 py-5 rounded-2xl transition-all duration-250"
                      style={selected ? opt.activeStyle : opt.inactiveStyle}
                    >
                      <span
                        className="text-3xl transition-transform duration-200"
                        style={{ filter: selected ? 'drop-shadow(0 0 8px currentColor)' : 'none', transform: selected ? 'scale(1.15)' : 'scale(1)' }}
                      >
                        {opt.emoji}
                      </span>
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className="text-sm font-semibold transition-colors duration-200"
                          style={{ color: selected ? opt.activeColor : opt.inactiveColor }}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[11px]" style={{ color: selected ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)' }}>
                          {opt.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* 구분선 */}
            <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* 상세 의견 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="feedback-content" className="text-slate-300 text-sm font-medium">
                  자세한 의견
                </label>
                <span className="text-slate-600 text-xs">선택 사항</span>
              </div>
              <textarea
                id="feedback-content"
                value={content}
                onChange={handleContentChange}
                placeholder="어떤 점이 좋았는지, 아쉬웠는지 알려주세요"
                rows={3}
                className="w-full text-white text-sm rounded-xl px-4 py-3 resize-none focus:outline-none placeholder:text-slate-600"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
              <p className="text-right text-slate-700 text-xs mt-1.5">{content.length} / 500</p>
            </div>

            {/* 에러 */}
            {error && (
              <p role="alert" className="text-rose-400 text-sm text-center">{error}</p>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={!satisfaction || isSubmitting}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={
                !satisfaction || isSubmitting
                  ? { background: 'rgba(255,255,255,0.05)', color: '#334155', cursor: !satisfaction ? 'not-allowed' : 'default' }
                  : {
                      background: 'linear-gradient(90deg, #6d28d9, #2563eb)',
                      color: '#fff',
                      boxShadow: '0 0 24px rgba(109,40,217,0.4), 0 4px 16px rgba(0,0,0,0.3)',
                    }
              }
            >
              {isSubmitting ? '전송 중...' : '피드백 보내기 ✦'}
            </button>

            {/* 나가기 버튼 (exit mode에서만 표시) */}
            {exitAction && (
              <button
                type="button"
                onClick={exitAction.onExit}
                className="w-full py-2 text-xs font-medium transition-colors duration-200"
                style={{ color: '#475569' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
              >
                피드백 없이 나가기
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
