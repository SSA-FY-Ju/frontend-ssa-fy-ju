'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useConsultation } from '@/hooks/useConsultation';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useSessionStore } from '@/stores/sessionStore';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { ConsultationLoading } from '@/components/results/ConsultationLoading';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { PageExitModal } from '@/components/common/PageExitModal';

// Swiper.js는 브라우저 전용 — SSR 비활성화 필수
const FullPageConsultation = dynamic(
  () =>
    import('@/components/consultation/FullPageConsultation').then(
      (m) => ({ default: m.FullPageConsultation })
    ),
  { ssr: false }
);

export default function ConsultationPage() {
  useRouteGuard(true);

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

  const { shouldShowExitModal, confirmExit, cancelExit } = usePageExitGuard();

  useEffect(() => {
    if (hasHydrated && birthDate && phase === 'idle') {
      submitConsultation(birthDate, birthTime ?? '12:00');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  return (
    <main className="relative z-10 min-h-screen text-white">
      {/* 페이지 이탈 경고 모달 */}
      <PageExitModal
        isOpen={shouldShowExitModal}
        onConfirmExit={confirmExit}
        onCancelExit={cancelExit}
        onLoginAndStay={cancelExit}
      />

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
    </main>
  );
}
