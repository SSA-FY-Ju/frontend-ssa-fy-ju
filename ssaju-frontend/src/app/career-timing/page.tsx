'use client';

/**
 * 관운 기반 채용 시기 분석 페이지
 * SEO 메타데이터는 app/career-timing/layout.tsx에서 관리
 *
 * 흐름: 입력 폼 → 고지 문구(1.5초) → 로딩 → 결과
 */

import { useEffect, useState } from 'react';
import { useCareerTiming } from '@/hooks/useCareerTiming';
import { usePageExitGuard } from '@/hooks/usePageExitGuard';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { useSessionStore } from '@/stores/sessionStore';
import { InputForm } from '@/components/forms/InputForm';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { LoadingProgress } from '@/components/results/LoadingProgress';
import { CareerTimingResult } from '@/components/results/CareerTimingResult';
import { PageExitModal } from '@/components/common/PageExitModal';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

export default function CareerTimingPage() {
  useRouteGuard(true);

  const { phase, result, error, disclaimerVisible, disclaimerFading, submitAnalysis, reset } =
    useCareerTiming();
  const birthDate = useSessionStore((s) => s.birthDate);
  const birthTime = useSessionStore((s) => s.birthTime);
  const hasHydrated = useSessionStore((s) => s._hasHydrated);

  // hydration 완료 + birthDate 확보 시 바로 분석 시작
  useEffect(() => {
    if (hasHydrated && birthDate && phase === 'idle') {
      submitAnalysis(birthDate, birthTime ?? '12:00');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, birthDate]);

  const { shouldShowExitModal, confirmExit, cancelExit } = usePageExitGuard();
  const { getDisplayMessage } = useErrorHandler();

  // 피드백 넛지: 결과 표시 3초 후 슬라이드업
  const [showFeedbackNudge, setShowFeedbackNudge] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  useEffect(() => {
    if (phase !== 'result') {
      setShowFeedbackNudge(false);
      setNudgeVisible(false);
      return;
    }
    const showTimer = setTimeout(() => {
      setShowFeedbackNudge(true);
      // 다음 프레임에서 visible 처리 (CSS 트랜지션 트리거용)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setNudgeVisible(true));
      });
    }, 3000);
    return () => clearTimeout(showTimer);
  }, [phase]);

  return (
    <main className="relative z-10 min-h-screen text-white pt-16">
      {/* 페이지 이탈 방지 모달 */}
      <PageExitModal
        isOpen={shouldShowExitModal}
        onConfirmExit={confirmExit}
        onCancelExit={cancelExit}
        onLoginAndStay={cancelExit}
      />

      {/* 고지 문구 오버레이 */}
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />

      {/* 결과 콘텐츠 — overlay 표시 중에는 visibility: hidden으로 완전히 가림 */}
      <div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12"
        style={{ visibility: disclaimerVisible ? 'hidden' : 'visible' }}
      >
        <div className="w-full max-w-lg">
          <h1 className="text-star-500 text-3xl font-bold text-center mb-2">관운 분석</h1>
          <p className="text-star-300 text-sm text-center mb-8">
            생년월일과 시간으로 채용 운이 좋은 시기를 알아보세요
          </p>

          {/* 입력 폼 (idle 또는 재시도 시) */}
          {(phase === 'idle' || phase === 'error') && (
            <>
              <InputForm onSubmit={submitAnalysis} isLoading={false} />
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
          {phase === 'loading' && (
            <LoadingProgress message="사주를 분석하고 있습니다..." />
          )}

          {/* 결과 */}
          {phase === 'result' && result && (
            <CareerTimingResult result={result} />
          )}
        </div>
      </div>

      {/* 피드백 넛지 — 3초 후 우측 하단 슬라이드업 */}
      {showFeedbackNudge && (
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
            {/* 상단: 아이콘 + 닫기 */}
            <div className="flex items-center justify-between">
              <span
                aria-hidden="true"
                style={{ fontSize: 18, color: '#a78bfa', filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.5))' }}
              >
                ✦
              </span>
              <button
                onClick={() => setShowFeedbackNudge(false)}
                aria-label="닫기"
                className="text-base leading-none transition-colors"
                style={{ color: 'rgba(148,163,184,0.45)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148,163,184,0.45)')}
              >
                ×
              </button>
            </div>

            {/* 텍스트 */}
            <div>
              <p className="text-white text-xs font-semibold leading-snug">
                이 결과에 대해 의견을 알려주세요
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(196,181,253,0.55)' }}>
                피드백이 서비스 개선에 도움이 됩니다
              </p>
            </div>

            {/* 버튼 */}
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="w-full text-xs font-bold py-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #6d28d9, #4f46e5)',
                color: '#fff',
                boxShadow: '0 0 10px rgba(109,40,217,0.4)',
              }}
            >
              의견 남기기
            </button>
          </div>
        </div>
      )}

      {feedbackModalOpen && (
        <FeedbackModal
          feedbackType="CAREER_TIMING"
          onClose={() => setFeedbackModalOpen(false)}
        />
      )}
    </main>
  );
}
