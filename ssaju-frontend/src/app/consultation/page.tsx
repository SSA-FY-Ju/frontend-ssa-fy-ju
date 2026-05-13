'use client';

// 파일 크기 예외: 8개 탭 컴포넌트 배열 정의가 페이지 내 필수 조립 로직을 구성.
// 별도 파일로 분리하면 탭 데이터 타입 참조가 복잡해져 응집도 유지가 어려움
/**
 * AI 커리어 컨설팅 페이지 (T079)
 *
 * 흐름: 입력 폼 → 고지 문구(1.5초) → AI 로딩(15-20초) → 8개 탭 결과
 */

import { useConsultation } from '@/hooks/useConsultation';
import { useAuth } from '@/hooks/useAuth';
import { InputForm } from '@/components/forms/InputForm';
import { DisclaimerOverlay } from '@/components/results/DisclaimerOverlay';
import { ConsultationLoading } from '@/components/results/ConsultationLoading';
import { ErrorMessage } from '@/components/errors/ErrorMessage';
import { TabNavigation } from '@/components/navigation/TabNavigation';
import { IndustriesTab } from '@/components/consultation/IndustriesTab';
import { InterviewTipsTab } from '@/components/consultation/InterviewTipsTab';
import { StrengthsTab } from '@/components/consultation/StrengthsTab';
import { SajuProfileTab } from '@/components/consultation/SajuProfileTab';
import { WealthStyleTab } from '@/components/consultation/WealthStyleTab';
import { CareerRoadmapTab } from '@/components/consultation/CareerRoadmapTab';
import { BrandingTab } from '@/components/consultation/BrandingTab';
import { MonthlyForecastTab } from '@/components/consultation/MonthlyForecastTab';

const TAB_COMPONENTS = [
  (data: NonNullable<ReturnType<typeof useConsultation>['consultation']>) => (
    <IndustriesTab industries={data.recommendedIndustries} />
  ),
  (data: NonNullable<ReturnType<typeof useConsultation>['consultation']>) => (
    <InterviewTipsTab tips={data.interviewTips} />
  ),
  (data: NonNullable<ReturnType<typeof useConsultation>['consultation']>) => (
    <StrengthsTab strengths={data.strengths} />
  ),
  (data: NonNullable<ReturnType<typeof useConsultation>['consultation']>) => (
    <SajuProfileTab profile={data.sajuProfile} />
  ),
  (data: NonNullable<ReturnType<typeof useConsultation>['consultation']>) => (
    <WealthStyleTab wealthStyle={data.wealthStyle} />
  ),
  (data: NonNullable<ReturnType<typeof useConsultation>['consultation']>) => (
    <CareerRoadmapTab roadmap={data.careerRoadmap} />
  ),
  (data: NonNullable<ReturnType<typeof useConsultation>['consultation']>) => (
    <BrandingTab branding={data.branding} />
  ),
  (data: NonNullable<ReturnType<typeof useConsultation>['consultation']>) => (
    <MonthlyForecastTab forecasts={data.monthlyForecasts} />
  ),
];

export default function ConsultationPage() {
  const { phase, error, disclaimerVisible, disclaimerFading, consultation, selectedTabIndex, submitConsultation, selectTab, reset } = useConsultation();
  const { isLoggedIn } = useAuth();

  return (
    <main className="min-h-screen bg-night-900 text-white">
      <DisclaimerOverlay isVisible={disclaimerVisible} isFading={disclaimerFading} />

      <div className="max-w-2xl mx-auto px-4 py-12">
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

        {/* 결과: 탭 네비게이션 + 컨텐츠 */}
        {phase === 'result' && consultation && (
          <div className="flex flex-col gap-4">
            <TabNavigation selectedIndex={selectedTabIndex} onSelect={selectTab} />
            <div
              role="tabpanel"
              id={`tab-panel-${selectedTabIndex}`}
              aria-labelledby={`tab-${selectedTabIndex}`}
              className="pt-2"
            >
              {TAB_COMPONENTS[selectedTabIndex]?.(consultation)}
            </div>

            {/* 저장 / 로그인 유도 */}
            <div className="mt-4">
              {isLoggedIn ? (
                <button className="w-full bg-star-500 hover:bg-star-400 text-night-900 font-bold py-3 rounded transition-colors">
                  이 결과 저장하기
                </button>
              ) : (
                <p className="text-center text-star-300 text-sm">
                  결과를 저장하려면 로그인해주세요
                </p>
              )}
            </div>

            {/* 새 분석 */}
            <button
              onClick={reset}
              className="w-full border border-night-700 hover:border-star-500 text-star-300 text-sm py-2 rounded transition-colors"
            >
              새 분석 시작하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
