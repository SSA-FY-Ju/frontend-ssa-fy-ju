'use client';

/**
 * AI 커리어 컨설팅 페이지 (T079)
 *
 * 흐름: 입력 폼 → 고지 문구(1.5초) → AI 로딩(20초) → fullpage.js 8섹션 전체화면
 *
 * 2026-05-13 변경:
 * - ConsultationScrollView (IntersectionObserver) → FullPageConsultation (fullpage.js)
 * - fullpage.js는 브라우저 전용 → dynamic({ ssr: false })로 임포트
 * - SectionNavigator가 FullPageConsultation 내부에서 fullpageApi와 연동
 */

import dynamic from 'next/dynamic';
import { useConsultation } from '@/hooks/useConsultation';
import { useAuth } from '@/hooks/useAuth';
import { InputForm } from '@/components/forms/InputForm';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { ConsultationLoading } from '@/components/results/ConsultationLoading';
import { ErrorMessage } from '@/components/errors/ErrorMessage';

// fullpage.js는 브라우저 전용 — SSR 비활성화 필수
const FullPageConsultation = dynamic(
  () =>
    import('@/components/consultation/FullPageConsultation').then(
      (m) => ({ default: m.FullPageConsultation })
    ),
  { ssr: false }
);

export default function ConsultationPage() {
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
  const { isLoggedIn } = useAuth();

  return (
    <main className="min-h-screen bg-night-900 text-white">
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />

      {/* 결과 페이지: fullpage.js가 전체 화면 차지 → 감싸는 컨테이너 없음 */}
      {phase === 'result' && consultation ? (
        <>
          <FullPageConsultation
            data={consultation}
            currentSectionIndex={currentSectionIndex}
            onSectionChange={handleSectionChange}
            onFeedback={() => {/* 피드백 모달은 FeedbackButton 내부에서 관리 */}}
          />

          {/* 저장 / 로그인 유도 (fullpage 위에 플로팅) */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
            {isLoggedIn ? (
              <button className="bg-star-500 hover:bg-star-400 text-night-900 font-bold px-6 py-3 rounded-lg shadow-lg transition-colors">
                이 결과 저장하기
              </button>
            ) : (
              <p className="text-star-300 text-sm bg-night-900/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                결과를 저장하려면 로그인해주세요
              </p>
            )}
            <button
              onClick={reset}
              className="border border-night-700 hover:border-star-500 text-star-300 text-xs px-4 py-2 rounded-lg bg-night-900/80 backdrop-blur-sm transition-colors"
            >
              새 분석 시작하기
            </button>
          </div>
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
