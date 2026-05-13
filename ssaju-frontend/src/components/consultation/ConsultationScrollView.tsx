'use client';

// 파일 크기 예외: 8개 섹션 조립 + SectionNavigator 연동이 하나의 컨설팅 탐색 UX를
// 구성. 분리 시 useSectionObserver ref 전달 구조가 복잡해지고 응집도 저하
/**
 * AI 컨설팅 스크롤 뷰 (T065)
 *
 * 기능:
 * - 8개 컨설팅 섹션을 세로로 배치 (TabNavigation 대체)
 * - useSectionObserver로 뷰포트 진입 감지 → 섹션 진입 애니메이션
 * - SectionNavigator와 activeSectionIndex 동기화
 * - prefers-reduced-motion 지원 (애니메이션 즉시 완료)
 *
 * 애니메이션 사양 (FR-060):
 * - opacity: 0 → 1, translateY: 24px → 0, 350ms ease-out
 * - threshold=0.5: 50% 진입 시 트리거
 */

import type { ConsultationData } from '@/types/api';
import { useSectionObserver } from '@/hooks/useSectionObserver';
import { SectionNavigator } from './SectionNavigator';
import { IndustriesTab } from './IndustriesTab';
import { InterviewTipsTab } from './InterviewTipsTab';
import { StrengthsTab } from './StrengthsTab';
import { SajuProfileTab } from './SajuProfileTab';
import { WealthStyleTab } from './WealthStyleTab';
import { CareerRoadmapTab } from './CareerRoadmapTab';
import { BrandingTab } from './BrandingTab';
import { MonthlyForecastTab } from './MonthlyForecastTab';

interface ConsultationScrollViewProps {
  data: ConsultationData;
}

/** 8개 섹션 정의 */
function buildSections(data: ConsultationData) {
  return [
    {
      label: '추천산업',
      id: 'section-industries',
      content: <IndustriesTab industries={data.recommendedIndustries} />,
    },
    {
      label: '면접팁',
      id: 'section-interview',
      content: <InterviewTipsTab tips={data.interviewTips} />,
    },
    {
      label: '강점',
      id: 'section-strengths',
      content: <StrengthsTab strengths={data.strengths} />,
    },
    {
      label: '사주프로필',
      id: 'section-saju',
      content: <SajuProfileTab profile={data.sajuProfile} />,
    },
    {
      label: '부의운',
      id: 'section-wealth',
      content: <WealthStyleTab wealthStyle={data.wealthStyle} />,
    },
    {
      label: '경력로드맵',
      id: 'section-roadmap',
      content: <CareerRoadmapTab roadmap={data.careerRoadmap} />,
    },
    {
      label: '브랜딩',
      id: 'section-branding',
      content: <BrandingTab branding={data.branding} />,
    },
    {
      label: '월별운세',
      id: 'section-monthly',
      content: <MonthlyForecastTab forecasts={data.monthlyForecasts} />,
    },
  ];
}

export function ConsultationScrollView({ data }: ConsultationScrollViewProps) {
  const { stableRefs, visibleSections, activeSectionIndex, scrollToSection } = useSectionObserver();
  const sections = buildSections(data);

  return (
    <div className="relative">
      {/* 섹션 네비게이터 (데스크톱: 우측 플로팅, 모바일: 상단 고정) */}
      {/* @deprecated — FullPageConsultation으로 대체됨 (2026-05-13) */}
      <SectionNavigator
        sections={['추천산업', '면접팁', '강점', '사주프로필', '부의운', '경력로드맵', '브랜딩', '월별운세']}
        currentIndex={activeSectionIndex}
        onNavigate={scrollToSection}
      />

      {/* 8개 섹션 세로 배치 */}
      <div className="flex flex-col">
        {sections.map(({ label, id, content }, index) => (
          <section
            key={id}
            id={id}
            ref={stableRefs[index]}
            aria-label={label}
            className={[
              // 섹션 간 구분 여백
              'py-10 border-b border-night-800 last:border-b-0',
              // 진입 애니메이션 (Constitution VIII: Phase 1 useMemo/useCallback 금지, CSS transition 사용)
              'transition-[opacity,transform] duration-[350ms] ease-out',
              visibleSections[index]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6',
            ].join(' ')}
          >
            {/* 섹션 제목 */}
            <h2 className="text-star-400 text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-star-500 text-sm">★</span>
              {label}
            </h2>
            {content}
          </section>
        ))}
      </div>
    </div>
  );
}
