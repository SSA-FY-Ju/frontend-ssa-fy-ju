'use client';

/**
 * 관운 기반 채용 시기 분석 페이지
 * SEO 메타데이터는 app/career-timing/layout.tsx에서 관리
 *
 * 흐름: 입력 폼 → 고지 문구(1.5초) → 로딩 → 결과
 */

import { useCareerTiming } from '@/hooks/useCareerTiming';
import { useAuth } from '@/hooks/useAuth';
import { useSave } from '@/hooks/useSave';
import { useAuthStore } from '@/stores/authStore';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { InputForm } from '@/components/forms/InputForm';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
import { CareerTimingResult } from '@/components/results/CareerTimingResult';
import { FeedbackButton } from '@/components/results/FeedbackButton';
import { LoginNudgeCard } from '@/components/common/LoginNudgeCard';
import { PageExitModal } from '@/components/common/PageExitModal';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function CareerTimingPage() {
  // Route Guard: require birthDate to access this result page
  useRouteGuard(true);

  const { phase, result, error, disclaimerVisible, disclaimerFading, submitAnalysis, reset } =
    useCareerTiming();
  const { isLoggedIn } = useAuth();
  const { save } = useSave('CAREER_TIMING');
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const { shouldShowExitModal, confirmExit, cancelExit } = usePageExitGuard();
  const { getDisplayMessage } = useErrorHandler();

  return (
    <main className="min-h-screen bg-night-900 text-white pt-16">
      {/* 페이지 이탈 방지 모달 */}
      <PageExitModal
        isOpen={shouldShowExitModal}
        onConfirmExit={confirmExit}
        onCancelExit={cancelExit}
        onLoginAndStay={() => { cancelExit(); openLoginModal(); }}
      />

      {/* 고지 문구 오버레이 */}
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />

      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-star-500 text-3xl font-bold text-center mb-2">관운 분석</h1>
        <p className="text-star-300 text-sm text-center mb-8">
          생년월일과 시간으로 채용 운이 좋은 시기를 알아보세요
        </p>

        {/* 입력 폼 (idle 또는 재시도 시) */}
        {(phase === 'idle' || phase === 'error') && (
          <>
            <InputForm
              onSubmit={submitAnalysis}
              isLoading={false}
            />
            {phase === 'error' && error && (
              <div className="mt-4">
                <ErrorMessage
                  message={getDisplayMessage(new Error(error))}
                  onRetry={reset}
                  retryLabel="다시 입력하기"
                />
              </div>
            )}
          </>
        )}

        {/* 로딩 */}
        {phase === 'loading' && <LoadingProgress message="사주를 분석하고 있습니다..." />}

        {/* 결과 */}
        {phase === 'result' && result && (
          <>
            <CareerTimingResult
              result={result}
              isLoggedIn={isLoggedIn}
              onSave={save}
              onLoginToSave={openLoginModal}
            />
            <div className="mt-4">
              <FeedbackButton feedbackType="CAREER_TIMING" />
            </div>
            <div className="mt-6">
              <LoginNudgeCard show={phase === 'result'} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
