'use client';

/**
 * AI 컨설팅 풀페이지 뷰 (T065)
 *
 * transform: translateY() 기반 풀페이지 스크롤:
 * - overflow: hidden 컨테이너 안에서 섹션 래퍼를 translateY로 이동
 * - GPU 가속 → 슬라이딩 모션 확실히 보임
 * - 700ms easeInOutCubic rAF 애니메이션
 * - wheel(50px 임계값 + 80ms 디바운스) / touch(60px) / keyboard(Arrow) 지원
 * - isNavigating lock으로 중복 트리거 방지
 * - 마지막 섹션에 저장/초기화 버튼 포함
 * - 각 섹션 콘텐츠 수직 중앙 정렬
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

const SECTION_COUNT = SECTION_LABELS.length;
const ANIMATION_DURATION = 700;

interface FullPageConsultationProps {
  data: ConsultationData;
  currentSectionIndex: number;
  onSectionChange: (index: number) => void;
  onFeedback?: () => void;
  isLoggedIn?: boolean;
  onReset?: () => void;
}

export function FullPageConsultation({
  data,
  currentSectionIndex,
  onSectionChange,
  isLoggedIn,
  onReset,
}: FullPageConsultationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  /** 섹션 전체를 감싸는 슬라이딩 래퍼 */
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isNavigating = useRef(false);
  const currentIndexRef = useRef(currentSectionIndex);

  useEffect(() => {
    currentIndexRef.current = currentSectionIndex;
  }, [currentSectionIndex]);

  /** easeInOutCubic 타이밍 함수 */
  const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /**
   * 지정 섹션으로 700ms translateY 슬라이드 애니메이션.
   * wrapperRef를 GPU-가속 transform으로 이동 → 슬라이딩 모션 보장.
   */
  const animateTo = useCallback(
    (index: number) => {
      const container = containerRef.current;
      const wrapper = wrapperRef.current;
      if (!container || !wrapper || isNavigating.current) return;

      const clampedIndex = Math.max(0, Math.min(SECTION_COUNT - 1, index));
      isNavigating.current = true;
      onSectionChange(clampedIndex);

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const vh = container.clientHeight || window.innerHeight;
      const startY = currentIndexRef.current * -vh;
      const targetY = clampedIndex * -vh;
      const distance = targetY - startY;

      const unlock = () => {
        setTimeout(() => {
          isNavigating.current = false;
        }, 100);
      };

      if (prefersReducedMotion) {
        wrapper.style.transform = `translateY(${targetY}px)`;
        unlock();
        return;
      }

      let startTime: number | null = null;
      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
        const y = startY + distance * easeInOutCubic(progress);
        wrapper.style.transform = `translateY(${y}px)`;
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          unlock();
        }
      };
      requestAnimationFrame(animate);
    },
    [onSectionChange]
  );

  /** 마우스 휠: deltaY 누적 50px 초과 + 80ms 디바운스 후 섹션 전환 */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let accumulated = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isNavigating.current) return;

      accumulated += e.deltaY;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const delta = accumulated;
        accumulated = 0;
        if (Math.abs(delta) < 50) return;

        const direction = delta > 0 ? 1 : -1;
        const next = Math.max(0, Math.min(SECTION_COUNT - 1, currentIndexRef.current + direction));
        if (next !== currentIndexRef.current) animateTo(next);
      }, 80);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (timer) clearTimeout(timer);
    };
  }, [animateTo]);

  /** 터치 스와이프: 60px 이상 이동 시 섹션 전환 */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isNavigating.current) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 60) return;
      const direction = delta > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(SECTION_COUNT - 1, currentIndexRef.current + direction));
      if (next !== currentIndexRef.current) animateTo(next);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [animateTo]);

  /** 키보드: ArrowDown/PageDown → 다음, ArrowUp/PageUp → 이전 */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNavigating.current) return;
      const direction =
        e.key === 'ArrowDown' || e.key === 'PageDown'
          ? 1
          : e.key === 'ArrowUp' || e.key === 'PageUp'
          ? -1
          : 0;
      if (!direction) return;
      const next = Math.max(0, Math.min(SECTION_COUNT - 1, currentIndexRef.current + direction));
      if (next !== currentIndexRef.current) animateTo(next);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animateTo]);

  const handleNavigate = useCallback((index: number) => animateTo(index), [animateTo]);

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
      <SectionNavigator
        sections={[...SECTION_LABELS]}
        currentIndex={currentSectionIndex}
        onNavigate={handleNavigate}
      />

      {/* overflow-hidden 창 — 래퍼가 translateY로 슬라이드 */}
      <div
        ref={containerRef}
        className="h-screen overflow-hidden"
        data-testid="fullpage-container"
      >
        {/* 슬라이딩 래퍼: 8섹션을 수직으로 쌓아 GPU transform으로 이동 */}
        <div
          ref={wrapperRef}
          className="will-change-transform"
          style={{ transform: 'translateY(0px)' }}
          data-testid="fullpage-wrapper"
        >
          {SECTION_LABELS.map((label, index) => (
            <div
              key={label}
              className="h-screen overflow-y-auto bg-night-900 flex flex-col justify-center"
              data-testid={`fullpage-section-${index}`}
            >
              <div className="max-w-3xl mx-auto px-4 py-8 w-full">
                <SectionTitle label={label} />
                {sections[index]}

                {index === SECTION_COUNT - 1 && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <FeedbackButton feedbackType="CONSULTATION" />
                    <div className="flex flex-col items-center gap-3 w-full pt-2 border-t border-night-700">
                      {isLoggedIn ? (
                        <button className="bg-star-500 hover:bg-star-400 text-night-900 font-bold px-6 py-3 rounded-lg shadow-lg transition-colors">
                          이 결과 저장하기
                        </button>
                      ) : (
                        <p className="text-star-300 text-sm bg-night-800 px-4 py-2 rounded-lg border border-night-700">
                          결과를 저장하려면 로그인해주세요
                        </p>
                      )}
                      <button
                        onClick={onReset}
                        className="border border-night-700 hover:border-star-500 text-star-300 text-xs px-4 py-2 rounded-lg transition-colors"
                      >
                        새 분석 시작하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
