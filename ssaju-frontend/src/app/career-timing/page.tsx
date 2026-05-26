'use client';

import { useEffect } from 'react';
import { useCareerTiming } from '@/hooks/useCareerTiming';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { useSessionStore } from '@/stores/sessionStore';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
import { CareerTimingResult } from '@/components/results/CareerTimingResult';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function CareerTimingPage() {
  const { isAllowed } = useRouteGuard(true);

  const { phase, result, error, disclaimerVisible, disclaimerFading, submitAnalysis, reset } =
    useCareerTiming();
  const birthDate = useSessionStore((s) => s.birthDate);
  const birthTime = useSessionStore((s) => s.birthTime);
  const hasHydrated = useSessionStore((s) => s._hasHydrated);
  const exitRequestPending = useSessionStore((s) => s.exitRequestPending);
  const clearExitRequest = useSessionStore((s) => s.clearExitRequest);

  useEffect(() => {
    if (isAllowed && hasHydrated && birthDate && phase === 'idle') {
      submitAnalysis(birthDate, birthTime ?? '12:00');
    }
  }, [isAllowed, hasHydrated, birthDate, birthTime, phase, submitAnalysis]);

  const { confirmExit } = usePageExitGuard({
    onExitAttempt: () => {
      confirmExit();
    },
  });

  const { getDisplayMessage } = useErrorHandler();

  useEffect(() => {
    if (!exitRequestPending) return;
    clearExitRequest();
    confirmExit();
  }, [exitRequestPending, clearExitRequest, confirmExit]);

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
    </main>
  );
}
