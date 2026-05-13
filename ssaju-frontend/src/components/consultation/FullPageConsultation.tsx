'use client';

/**
 * AI 컨설팅 풀페이지 뷰 (T065)
 *
 * fullpage.js 방식 CSS transition 기반 풀페이지 스크롤:
 * - CSS `transition: transform 700ms ease` — 브라우저 최적화, rAF 루프 불필요
 * - 터치 드래그 중: transition: none (실시간 추적) → 손 뗌: transition 복구 후 스냅
 * - wheel(50px 임계값 + 80ms 디바운스) / touch(60px 스와이프) / keyboard(Arrow) 지원
 * - isNavigating lock + transitionend 이벤트로 중복 트리거 방지
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
/** fullpage.js 기본값과 동일한 애니메이션 설정 */
const TRANSITION = 'transform 700ms ease';

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

  /** 래퍼의 현재 translateY 값 읽기 (드래그 중 중간 위치에서 스냅 시작) */
  const getCurrentY = (): number => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return 0;
    const match = wrapper.style.transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
    return match ? parseFloat(match[1]) : 0;
  };

  /**
   * 지정 섹션으로 CSS transition 슬라이드 (fullpage.js 방식).
   * - CSS `transition: transform 700ms ease` → 브라우저 내장 최적화
   * - transitionend 이벤트로 완료 감지 → isNavigating 해제
   * - prefers-reduced-motion: transition none, 즉시 이동
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
      const targetY = clampedIndex * -vh;

      if (prefersReducedMotion) {
        wrapper.style.transition = 'none';
        wrapper.style.transform = `translateY(${targetY}px)`;
        isNavigating.current = false;
        return;
      }

      // CSS transition으로 애니메이션 — fullpage.js와 동일한 방식
      wrapper.style.transition = TRANSITION;
      wrapper.style.transform = `translateY(${targetY}px)`;

      const onTransitionEnd = () => {
        wrapper.removeEventListener('transitionend', onTransitionEnd);
        setTimeout(() => {
          isNavigating.current = false;
        }, 50);
      };
      wrapper.addEventListener('transitionend', onTransitionEnd);
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

  /**
   * 터치: 드래그하면 페이지가 손가락을 따라 실시간으로 이동,
   * 손가락을 떼면 이동량에 따라 다음 섹션 또는 현재 섹션으로 스냅.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let dragBaseY = 0; // 드래그 시작 시점의 래퍼 translateY

    const handleTouchStart = (e: TouchEvent) => {
      if (isNavigating.current) return;
      touchStartY = e.touches[0].clientY;
      dragBaseY = getCurrentY();
      // 드래그 중 CSS transition 비활성화 → 손가락에 즉시 반응
      const wrapper = wrapperRef.current;
      if (wrapper) wrapper.style.transition = 'none';
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isNavigating.current) return;
      e.preventDefault(); // 브라우저 기본 스크롤 차단
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const deltaY = e.touches[0].clientY - touchStartY;
      const vh = container.clientHeight || window.innerHeight;
      const newY = dragBaseY + deltaY;

      // 첫/마지막 섹션 경계에서 저항감 적용 (드래그 량의 25%만 반영)
      const minY = -(SECTION_COUNT - 1) * vh;
      let clampedY: number;
      if (newY > 0) {
        clampedY = newY * 0.25; // 첫 섹션 위로 당길 때
      } else if (newY < minY) {
        clampedY = minY + (newY - minY) * 0.25; // 마지막 섹션 아래로 당길 때
      } else {
        clampedY = newY;
      }

      wrapper.style.transform = `translateY(${clampedY}px)`;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isNavigating.current) return;
      const delta = touchStartY - e.changedTouches[0].clientY;

      // 60px 미만 이동 → 현재 섹션으로 스냅백
      if (Math.abs(delta) < 60) {
        animateTo(currentIndexRef.current);
        return;
      }

      const direction = delta > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(SECTION_COUNT - 1, currentIndexRef.current + direction));
      animateTo(next);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [animateTo]);

  /**
   * 마우스 드래그: 클릭 후 아래로 끌면 다음 페이지가 올라오고,
   * 마우스를 떼면 이동량에 따라 섹션 스냅.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDragging = false;
    let mouseStartY = 0;
    let dragBaseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (isNavigating.current) return;
      isDragging = true;
      mouseStartY = e.clientY;
      dragBaseY = getCurrentY();
      const wrapper = wrapperRef.current;
      if (wrapper) wrapper.style.transition = 'none';
      // 드래그 중 텍스트 선택 방지
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isNavigating.current) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const deltaY = e.clientY - mouseStartY;
      const vh = container.clientHeight || window.innerHeight;
      const newY = dragBaseY + deltaY;

      const minY = -(SECTION_COUNT - 1) * vh;
      let clampedY: number;
      if (newY > 0) {
        clampedY = newY * 0.25;
      } else if (newY < minY) {
        clampedY = minY + (newY - minY) * 0.25;
      } else {
        clampedY = newY;
      }

      wrapper.style.transform = `translateY(${clampedY}px)`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;

      if (isNavigating.current) return;
      const delta = mouseStartY - e.clientY;

      if (Math.abs(delta) < 60) {
        animateTo(currentIndexRef.current);
        return;
      }

      const direction = delta > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(SECTION_COUNT - 1, currentIndexRef.current + direction));
      animateTo(next);
    };

    // mouseup/mouseleave는 window에 등록 — 컨테이너 밖에서 마우스를 떼도 처리
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
      {/* touch-action: none → 브라우저 네이티브 스크롤 선점 차단, touchmove 실시간 추적 보장 */}
      {/* cursor: grab → 마우스 드래그 가능함을 시각적으로 표시 */}
      <div
        ref={containerRef}
        className="h-screen overflow-hidden"
        style={{ touchAction: 'none', cursor: 'grab' }}
        data-testid="fullpage-container"
      >
        {/* 슬라이딩 래퍼: 8섹션을 수직으로 쌓아 GPU transform으로 이동 */}
        <div
          ref={wrapperRef}
          className="will-change-transform"
          style={{ transform: 'translateY(0px)', touchAction: 'none' }}
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
