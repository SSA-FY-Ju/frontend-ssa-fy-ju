'use client';

interface FeedbackNudgeProps {
  visible: boolean;
  onDismiss: () => void;
  onOpenFeedback: () => void;
}

/** AI 컨설팅 마지막 섹션 도달 시 표시되는 피드백 유도 카드 */
export function FeedbackNudge({ visible, onDismiss, onOpenFeedback }: FeedbackNudgeProps) {
  return (
    <div
      role="complementary"
      aria-label="피드백 요청"
      className="fixed bottom-6 right-6 z-50"
      style={{
        transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      <div
        className="flex flex-col gap-3 rounded-2xl shadow-2xl p-4"
        style={{
          width: 240,
          background: 'rgba(10,12,28,0.97)',
          border: '1px solid rgba(139,92,246,0.3)',
        }}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 18, color: '#a78bfa', filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.5))' }}>✦</span>
          <button
            onClick={onDismiss}
            aria-label="닫기"
            className="text-base leading-none transition-colors"
            style={{ color: 'rgba(148,163,184,0.45)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148,163,184,0.45)')}
          >×</button>
        </div>
        <div>
          <p className="text-white text-xs font-semibold leading-snug">이 결과에 대해 의견을 알려주세요</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(196,181,253,0.55)' }}>피드백이 서비스 개선에 도움이 됩니다</p>
        </div>
        <button
          onClick={onOpenFeedback}
          className="w-full text-xs font-bold py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{ background: 'linear-gradient(90deg, #6d28d9, #4f46e5)', color: '#fff', boxShadow: '0 0 10px rgba(109,40,217,0.4)' }}
        >
          의견 남기기
        </button>
      </div>
    </div>
  );
}
