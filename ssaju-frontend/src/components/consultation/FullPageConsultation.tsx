'use client';
// [Exception: Principle IV] fullpage.js 사용 — 스크롤 스냅 직접 구현 복잡도 과다, 사용자 명시 요청

/**
 * AI 컨설팅 풀페이지 뷰 (T065)
 *
 * fullpage.js 전체화면 스냅 스크롤로 8개 분석 섹션 표시
 * - 각 섹션 = 100vh 독립 전체 화면
 * - scrollingSpeed: 700ms 스냅 전환
 * - responsiveWidth: 768 → 모바일에서 일반 스크롤로 폴백
 * - prefers-reduced-motion: scrollingSpeed: 0 (즉시 전환)
 * - SSR: 이 컴포넌트는 dynamic({ ssr: false })로 임포트할 것 (fullpage.js는 브라우저 전용)
 */

import { useRef } from 'react';
import ReactFullpage from '@fullpage/react-fullpage';
import type { fullpageApi } from '@fullpage/react-fullpage';
import type { ConsultationData } from '@/types/api';
import { SectionNavigator } from './SectionNavigator';
import { IndustriesTab } from './IndustriesTab';
import { InterviewTipsTab } from './InterviewTipsTab';
import { StrengthsTab } from './StrengthsTab';
import { SajuProfileTab } from './SajuProfileTab';
import { WealthStyleTab } from './WealthStyleTab';
import { CareerRoadmapTab } from './CareerRoadmapTab';
import { BrandingTab } from './BrandingTab';
import { MonthlyForecastTab } from './MonthlyForecastTab';
import { FeedbackButton } from '@/components/results/FeedbackButton';

const SECTION_LABELS = [
  '추천산업',
  '면접팁',
  '강점',
  '사주프로필',
  '부의운',
  '경력로드맵',
  '브랜딩',
  '월별운세',
] as const;

interface FullPageConsultationProps {
  data: ConsultationData;
  currentSectionIndex: number;
  onSectionChange: (index: number) => void;
  onFeedback?: () => void;
}

export function FullPageConsultation({
  data,
  currentSectionIndex,
  onSectionChange,
}: FullPageConsultationProps) {
  const apiRef = useRef<fullpageApi | null>(null);

  const handleNavigate = (index: number) => {
    // fullpage.js moveTo는 1-based index 사용
    apiRef.current?.moveTo(index + 1);
  };

  return (
    <div className="relative">
      {/* 섹션 네비게이터 (데스크톱: 우측 플로팅, 모바일: 상단 고정) */}
      <SectionNavigator
        sections={[...SECTION_LABELS]}
        currentIndex={currentSectionIndex}
        onNavigate={handleNavigate}
      />

      <ReactFullpage
        licenseKey=""
        credits={{ enabled: false }}
        scrollingSpeed={700}
        easing="easeInOutCubic"
        scrollOverflow={true}
        normalScrollElements=".feedback-modal"
        responsiveWidth={768}
        afterLoad={(_origin, destination) => {
          // destination.index는 0-based
          onSectionChange(destination.index);
        }}
        afterRender={() => {
          // prefers-reduced-motion 활성 시 스냅 즉시 완료
          if (
            typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
            apiRef.current
          ) {
            apiRef.current.setScrollingSpeed(0);
          }
        }}
        render={({ fullpageApi: api }) => {
          // render 호출마다 최신 api 참조 갱신
          apiRef.current = api;

          return (
            <ReactFullpage.Wrapper>
              {/* 섹션 1: 추천산업 */}
              <div className="section bg-night-900">
                <div className="max-w-3xl mx-auto px-4 py-10 h-full overflow-y-auto">
                  <SectionTitle label="추천산업" />
                  <IndustriesTab industries={data.recommendedIndustries} />
                </div>
              </div>

              {/* 섹션 2: 면접팁 */}
              <div className="section bg-night-900">
                <div className="max-w-3xl mx-auto px-4 py-10 h-full overflow-y-auto">
                  <SectionTitle label="면접팁" />
                  <InterviewTipsTab tips={data.interviewTips} />
                </div>
              </div>

              {/* 섹션 3: 강점 */}
              <div className="section bg-night-900">
                <div className="max-w-3xl mx-auto px-4 py-10 h-full overflow-y-auto">
                  <SectionTitle label="강점" />
                  <StrengthsTab strengths={data.strengths} />
                </div>
              </div>

              {/* 섹션 4: 사주프로필 */}
              <div className="section bg-night-900">
                <div className="max-w-3xl mx-auto px-4 py-10 h-full overflow-y-auto">
                  <SectionTitle label="사주프로필" />
                  <SajuProfileTab profile={data.sajuProfile} />
                </div>
              </div>

              {/* 섹션 5: 부의운 */}
              <div className="section bg-night-900">
                <div className="max-w-3xl mx-auto px-4 py-10 h-full overflow-y-auto">
                  <SectionTitle label="부의운" />
                  <WealthStyleTab wealthStyle={data.wealthStyle} />
                </div>
              </div>

              {/* 섹션 6: 경력로드맵 */}
              <div className="section bg-night-900">
                <div className="max-w-3xl mx-auto px-4 py-10 h-full overflow-y-auto">
                  <SectionTitle label="경력로드맵" />
                  <CareerRoadmapTab roadmap={data.careerRoadmap} />
                </div>
              </div>

              {/* 섹션 7: 브랜딩 */}
              <div className="section bg-night-900">
                <div className="max-w-3xl mx-auto px-4 py-10 h-full overflow-y-auto">
                  <SectionTitle label="브랜딩" />
                  <BrandingTab branding={data.branding} />
                </div>
              </div>

              {/* 섹션 8: 월별운세 + 피드백 */}
              <div className="section bg-night-900">
                <div className="max-w-3xl mx-auto px-4 py-10 h-full overflow-y-auto">
                  <SectionTitle label="월별운세" />
                  <MonthlyForecastTab forecasts={data.monthlyForecasts} />
                  {/* 마지막 섹션에서 피드백 버튼 표시 */}
                  <div className="mt-8">
                    <FeedbackButton feedbackType="CONSULTATION" />
                  </div>
                </div>
              </div>
            </ReactFullpage.Wrapper>
          );
        }}
      />
    </div>
  );
}

/** 섹션 제목 서브컴포넌트 */
function SectionTitle({ label }: { label: string }) {
  return (
    <h2 className="text-star-400 text-xl font-bold mb-6 flex items-center gap-2">
      <span className="text-star-500 text-sm">★</span>
      {label}
    </h2>
  );
}
