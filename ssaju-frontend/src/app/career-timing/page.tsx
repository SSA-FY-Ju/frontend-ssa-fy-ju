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

export default function CareerTimingPage() {
  const { isAllowed } = useRouteGuard(true);

  const { phase, result, error, disclaimerVisible, disclaimerFading, submitAnalysis, reset } =
    useCareerTiming();
  const birthDate = useSessionStore((s) => s.birthDate);
  const birthTime = useSessionStore((s) => s.birthTime);
  const hasHydrated = useSessionStore((s) => s._hasHydrated);
  const exitRequestPending = useSessionStore((s) => s.exitRequestPending);
  const clearExitRequest = useSessionStore((s) => s.clearExitRequest);

  // 자동 분석 시작
  useEffect(() => {
    if (isAllowed && hasHydrated && birthDate && phase === 'idle') {
      submitAnalysis(birthDate, birthTime ?? '12:00');
    }
  }, [isAllowed, hasHydrated, birthDate, birthTime, phase, submitAnalysis]);

  // idle이 3초 이상 지속되면 수동 재시도 버튼 표시
  const [showRetry, setShowRetry] = useState(false);
  useEffect(() => {
    if (phase !== 'idle' || !isAllowed) {
      setShowRetry(false);
      return;
    }
    const t = setTimeout(() => setShowRetry(true), 3000);
    return () => clearTimeout(t);
  }, [phase, isAllowed]);

  const handleManualStart = () => {
    if (!birthDate) return;
    reset();
    setShowRetry(false);
    submitAnalysis(birthDate, birthTime ?? '12:00');
  };

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
          {phase === 'idle' && (
            <div className="flex flex-col items-center gap-8">
              <LoadingProgress message="사주를 분석하고 있습니다..." />
              {showRetry && (
                <div className="flex flex-col items-center gap-3">
                  <p style={{ fontSize: 13, color: 'rgba(196,181,253,0.45)', textAlign: 'center' }}>
                    분석이 시작되지 않았나요?
                  </p>
                  <button
                    onClick={handleManualStart}
                    style={{
                      padding: '10px 28px',
                      borderRadius: 12,
                      border: '1px solid rgba(139,92,246,0.4)',
                      background: 'rgba(139,92,246,0.12)',
                      color: '#c4b5fd',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139,92,246,0.24)';
                      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.65)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(139,92,246,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                    }}
                  >
                    ✦ 분석 시작하기
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'loading' && (
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
