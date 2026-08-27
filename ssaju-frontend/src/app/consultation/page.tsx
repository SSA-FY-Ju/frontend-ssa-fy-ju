'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useConsultation } from '@/hooks/useConsultation';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useSessionStore } from '@/stores/sessionStore';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { ConsultationLoading } from '@/components/results/ConsultationLoading';
import { ErrorMessage } from '@/components/errors/ErrorMessage';

const FeedbackModal = dynamic(() => import('@/components/modals/FeedbackModal/FeedbackModal').then((m) => m.FeedbackModal), { ssr: false });
import { FeedbackNudge } from '@/components/consultation/FeedbackNudge';

// Swiper.js는 브라우저 전용 — SSR 비활성화 필수
const FullPageConsultation = dynamic(
  () =>
    import('@/components/consultation/FullPageConsultation').then(
      (m) => ({ default: m.FullPageConsultation })
    ),
  { ssr: false }
);

export default function ConsultationPage() {
  const { isAllowed } = useRouteGuard(true);

  const {
    phase,
    error,
    disclaimerVisible,
    disclaimerFading,
    consultation,
    currentSectionIndex,
    handleSectionChange,
    submitConsultation,
    reset,
  } = useConsultation();
  const birthDate = useSessionStore((s) => s.birthDate);
  const birthTime = useSessionStore((s) => s.birthTime);
  const hasHydrated = useSessionStore((s) => s._hasHydrated);
  const sajuResultId = useSessionStore((s) => s.sajuResultId);
  const feedbackGivenIds = useSessionStore((s) => s.feedbackGivenIds);
  const setFeedbackGiven = useSessionStore((s) => s.setFeedbackGiven);
  const exitRequestPending = useSessionStore((s) => s.exitRequestPending);
  const clearExitRequest = useSessionStore((s) => s.clearExitRequest);
  const hasFeedback = !!sajuResultId && feedbackGivenIds.includes(`${sajuResultId}_CONSULTATION`);

  useEffect(() => {
    if (isAllowed && hasHydrated && birthDate && phase === 'idle') {
      submitConsultation(birthDate, birthTime ?? '12:00');
    }
  }, [isAllowed, hasHydrated, birthDate, birthTime, phase, submitConsultation]);

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

  // 피드백 넛지 — 마지막 섹션(인덱스 2) 도달 시 표시
  const [showFeedbackNudge, setShowFeedbackNudge] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const nudgeShownRef = useRef(false);
  const LAST_SECTION = 10;

  useEffect(() => {
    if (phase !== 'result') {
      setShowFeedbackNudge(false);
      setNudgeVisible(false);
      return;
    }
  }, [phase]);

  useEffect(() => {
    if (currentSectionIndex !== LAST_SECTION) return;
    if (nudgeShownRef.current) return;
    nudgeShownRef.current = true;
    const t = setTimeout(() => {
      setShowFeedbackNudge(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setNudgeVisible(true);
        setTimeout(() => setNudgeVisible(false), 5000);
        setTimeout(() => setShowFeedbackNudge(false), 5500);
      }));
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex]);

  const handleFeedbackSubmitted = () => {
    if (sajuResultId) setFeedbackGiven(sajuResultId, 'CONSULTATION');
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
    <main className="relative z-10 min-h-screen text-white">
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />

      {phase === 'result' && consultation ? (
        <FullPageConsultation
          data={consultation}
          currentSectionIndex={currentSectionIndex}
          onSectionChange={handleSectionChange}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center min-h-screen px-4"
          style={{ visibility: disclaimerVisible ? 'hidden' : 'visible' }}
        >
          {phase === 'error' && error ? (
            <div className="w-full max-w-sm">
              <ErrorMessage message={error} onRetry={reset} retryLabel="다시 시도" />
            </div>
          ) : (
            <ConsultationLoading />
          )}
        </div>
      )}

      {/* 피드백 넛지 — 피드백 완료 전에만 표시 */}
      {showFeedbackNudge && !hasFeedback && (
        <FeedbackNudge
          visible={nudgeVisible}
          onDismiss={() => setShowFeedbackNudge(false)}
          onOpenFeedback={() => { setFeedbackIsExitMode(false); setFeedbackModalOpen(true); }}
        />
      )}

      {feedbackModalOpen && (
        <FeedbackModal
          feedbackType="CONSULTATION"
          onClose={handleFeedbackClose}
          onSubmitted={handleFeedbackSubmitted}
          exitAction={feedbackIsExitMode ? { onExit: confirmExit } : undefined}
        />
      )}
    </main>
  );
}
