'use client';

/**
 * AI 컨설팅 풀페이지 뷰 (T065)
 *
 * CSS scroll-snap으로 fullpage.js 동일 UX 구현 (라이선스 없이 무료)
 * - 각 섹션 = 100vh 독립 전체 화면 (scroll-snap-type: y mandatory)
 * - IntersectionObserver로 활성 섹션 추적 → currentSectionIndex 동기화
 * - container.scrollTo({ behavior: 'smooth' })로 프로그래매틱 이동
 * - prefers-reduced-motion: behavior: 'instant' 즉시 전환
 * - 모바일: 동일 동작 (CSS scroll-snap은 추가 설정 불필요)
 */

import { useRef, useEffect, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>(Array(8).fill(null));

  /** IntersectionObserver: 섹션이 50% 이상 보일 때 활성 섹션 업데이트 */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              onSectionChange(index);
            }
          });
        },
        { root: container, threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [onSectionChange]);

  /** easeInOutCubic 타이밍 함수 (t: 0→1) */
  const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /** 섹션 네비게이터 클릭 → 700ms easeInOutCubic 스크롤 */
  const handleNavigate = useCallback((index: number) => {
    const container = containerRef.current;
    const section = sectionRefs.current[index];
    if (!container || !section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startTop = container.scrollTop;
    const targetTop = section.offsetTop;
    const distance = targetTop - startTop;

    if (prefersReducedMotion) {
      container.scrollTop = targetTop;
      return;
    }

    const duration = 700;
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.scrollTop = startTop + distance * easeInOutCubic(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const sections = [
    <IndustriesTab key="industries" industries={data.recommendedIndustries} />,
    <InterviewTipsTab key="interview" tips={data.interviewTips} />,
    <StrengthsTab key="strengths" strengths={data.strengths} />,
    <SajuProfileTab key="saju" profile={data.sajuProfile} />,
    <WealthStyleTab key="wealth" wealthStyle={data.wealthStyle} />,
    <CareerRoadmapTab key="roadmap" roadmap={data.careerRoadmap} />,
    <BrandingTab key="branding" branding={data.branding} />,
    <MonthlyForecastTab key="monthly" forecasts={data.monthlyForecasts} />,
  ];

  return (
    <div className="relative">
      {/* 섹션 네비게이터 (데스크톱: 우측 플로팅, 모바일: 상단 고정) */}
      <SectionNavigator
        sections={[...SECTION_LABELS]}
        currentIndex={currentSectionIndex}
        onNavigate={handleNavigate}
      />

      {/* 풀페이지 스냅 스크롤 컨테이너 */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory' }}
        data-testid="fullpage-container"
      >
        {SECTION_LABELS.map((label, index) => (
          <div
            key={label}
            ref={(el) => { sectionRefs.current[index] = el; }}
            className="h-screen overflow-y-auto bg-night-900"
            style={{ scrollSnapAlign: 'start' }}
            data-testid={`fullpage-section-${index}`}
          >
            <div className="max-w-3xl mx-auto px-4 py-10">
              <SectionTitle label={label} />
              {sections[index]}
              {/* 마지막 섹션(월별운세)에 피드백 버튼 */}
              {index === 7 && (
                <div className="mt-8">
                  <FeedbackButton feedbackType="CONSULTATION" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <h2 className="text-star-400 text-xl font-bold mb-6 flex items-center gap-2">
      <span className="text-star-500 text-sm">★</span>
      {label}
    </h2>
  );
}
