'use client';

import { useEffect, useState } from 'react';
import { useCareerTiming } from '@/hooks/useCareerTiming';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { useSessionStore } from '@/stores/sessionStore';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
import { CareerTimingResult } from '@/components/results/CareerTimingResult';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

export default function CareerTimingPage() {
  const { isAllowed } = useRouteGuard(true);

  const { phase, result, error, disclaimerVisible, disclaimerFading, submitAnalysis, reset } =
    useCareerTiming();
  const birthDate = useSessionStore((s) => s.birthDate);
  const birthTime = useSessionStore((s) => s.birthTime);
  const hasHydrated = useSessionStore((s) => s._hasHydrated);
  const sajuResultId = useSessionStore((s) => s.sajuResultId);
  const feedbackGivenIds = useSessionStore((s) => s.feedbackGivenIds);
  const setFeedbackGiven = useSessionStore((s) => s.setFeedbackGiven);
  const exitRequestPending = useSessionStore((s) => s.exitRequestPending);
  const clearExitRequest = useSessionStore((s) => s.clearExitRequest);
  const hasFeedback = !!sajuResultId && feedbackGivenIds.includes(`${sajuResultId}_CAREER_TIMING`);

  useEffect(() => {
    if (hasHydrated && birthDate && phase === 'idle') {
      submitAnalysis(birthDate, birthTime ?? '12:00');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, birthDate]);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackIsExitMode, setFeedbackIsExitMode] = useState(false);

  const { confirmExit } = usePageExitGuard({
    onExitAttempt: () => {
      if (!hasFeedback) {
        setFeedbackIsExitMode(true);
        setFeedbackModalOpen(true);
      } else {
        confirmExit();
      }
    },
  });

  const { getDisplayMessage } = useErrorHandler();

  // 피드백 넛지: 결과 표시 1초 후 슬라이드업
  const [showFeedbackNudge, setShowFeedbackNudge] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);

  useEffect(() => {
    if (phase !== 'result') {
      setShowFeedbackNudge(false);
      setNudgeVisible(false);
      return;
    }
    const t = setTimeout(() => {
      setShowFeedbackNudge(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setNudgeVisible(true);
        setTimeout(() => setNudgeVisible(false), 5000);
        setTimeout(() => setShowFeedbackNudge(false), 5500);
      }));
    }, 1000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleFeedbackSubmitted = () => {
    if (sajuResultId) setFeedbackGiven(sajuResultId, 'CAREER_TIMING');
    if (feedbackIsExitMode) confirmExit();
  };

  const handleFeedbackClose = () => {
    setFeedbackModalOpen(false);
    setFeedbackIsExitMode(false);
  };

  useEffect(() => {
    if (!exitRequestPending) return;
    clearExitRequest();
    if (!hasFeedback) {
      setFeedbackIsExitMode(true);
      setFeedbackModalOpen(true);
    } else {
      confirmExit();
    }
  }, [exitRequestPending, hasFeedback, clearExitRequest, confirmExit]);

  if (!isAllowed) return null;

  return (
    <main className="relative z-10 min-h-screen text-white pt-16">
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />

      <div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12"
        style={{ visibility: disclaimerVisible ? 'hidden' : 'visible' }}
      >
        <div className="w-full max-w-lg">
          {(phase === 'idle' || phase === 'loading') && (
            <LoadingProgress message="사주를 분석하고 있습니다..." />
          )}

          {phase === 'error' && error && (
            <ErrorMessage
              message={getDisplayMessage(new Error(error))}
              onRetry={reset}
              retryLabel="다시 시도"
            />
          )}

          {phase === 'result' && result && <CareerTimingResult result={result} />}
        </div>
      </div>

      {/* 피드백 넛지 — 피드백 완료 전에만 표시 */}
      {showFeedbackNudge && !hasFeedback && (
        <div
          role="complementary"
          aria-label="피드백 요청"
          className="fixed bottom-6 right-6 z-50"
          style={{
            transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1)',
            opacity: nudgeVisible ? 1 : 0,
            transform: nudgeVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <div
            className="flex flex-col gap-3 rounded-2xl shadow-2xl p-4"
            style={{
              width: 240,
              backdropFilter: 'blur(12px)',
              background: 'rgba(10,12,28,0.9)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 18, color: '#a78bfa', filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.5))' }}>✦</span>
              <button
                onClick={() => setShowFeedbackNudge(false)}
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
              onClick={() => { setFeedbackIsExitMode(false); setFeedbackModalOpen(true); }}
              className="w-full text-xs font-bold py-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(90deg, #6d28d9, #4f46e5)', color: '#fff', boxShadow: '0 0 10px rgba(109,40,217,0.4)' }}
            >
              의견 남기기
            </button>
          </div>
        </div>
      )}

      {feedbackModalOpen && (
        <FeedbackModal
          feedbackType="CAREER_TIMING"
          onClose={handleFeedbackClose}
          onSubmitted={handleFeedbackSubmitted}
          exitAction={feedbackIsExitMode ? { onExit: confirmExit } : undefined}
        />
      )}
    </main>
  );
}
