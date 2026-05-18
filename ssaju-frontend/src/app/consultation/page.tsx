'use client';

/**
 * AI 커리어 컨설팅 페이지 (T079)
 *
 * 흐름: 입력 폼 → 고지 문구(1.5초) → AI 로딩(20초) → CSS scroll-snap 8섹션 전체화면
 *
 * 2026-05-13 변경:
 * - ConsultationScrollView (IntersectionObserver 애니메이션) → FullPageConsultation (CSS scroll-snap)
 * - IntersectionObserver + window.matchMedia 접근 → dynamic({ ssr: false })로 클라이언트 전용 렌더
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useConsultation } from '@/hooks/useConsultation';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { useSessionStore } from '@/stores/sessionStore';
import { InputForm } from '@/components/forms/InputForm';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { ConsultationLoading } from '@/components/results/ConsultationLoading';
import { ErrorMessage } from '@/components/errors/ErrorMessage';

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

  useEffect(() => {
    if (hasHydrated && birthDate && phase === 'idle') {
      submitConsultation(birthDate, birthTime ?? '12:00');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);
  return (
    <main className="relative z-10 min-h-screen text-white pt-16">
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />

      {/* 결과 페이지: fullpage.js가 전체 화면 차지 → 감싸는 컨테이너 없음 */}
      {phase === 'result' && consultation ? (
        <>
          <FullPageConsultation
            data={consultation}
            currentSectionIndex={currentSectionIndex}
            onSectionChange={handleSectionChange}
          />

          {/* 새 분석 시작하기 (우하단 플로팅) */}
          <button
            onClick={reset}
            className="fixed bottom-6 right-6 z-50 border border-night-700 hover:border-star-500 text-star-300 text-xs px-4 py-2 rounded-lg bg-night-900/80 backdrop-blur-sm transition-colors"
          >
            새 분석 시작하기
          </button>
        </>
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-star-500 text-3xl font-bold text-center mb-2">AI 커리어 컨설팅</h1>
          <p className="text-star-300 text-sm text-center mb-8">
            생년월일과 시간으로 맞춤 커리어 컨설팅을 받아보세요
          </p>

          {/* 입력 폼 */}
          {(phase === 'idle' || phase === 'error') && (
            <>
              <InputForm onSubmit={(date, time) => submitConsultation(date, time)} isLoading={false} />
              {phase === 'error' && error && (
                <div className="mt-4">
                  <ErrorMessage message={error} onRetry={reset} retryLabel="다시 시도" />
                </div>
              )}
            </>
          )}

          {/* AI 로딩 */}
          {phase === 'loading' && <ConsultationLoading />}
        </div>
      )}
    </main>
  );
}
