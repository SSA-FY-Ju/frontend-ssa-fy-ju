'use client';

/**
 * AI 컨설팅 풀페이지 뷰 (T065)
 *
 * CSS scroll-snap으로 fullpage.js 동일 UX 구현 (라이선스 없이 무료)
 * - 각 섹션 = 100vh 독립 전체 화면 (scroll-snap-type: y mandatory)
 * - IntersectionObserver로 활성 섹션 추적 → currentSectionIndex 동기화
 * - 마우스 휠: e.preventDefault() + 700ms 락으로 한 번에 한 섹션씩 이동
 * - 네비게이터 클릭: scrollTo({ behavior: 'smooth' })
 * - 마지막 섹션 최초 도달 시 비로그인 사용자에게 회원가입 모달 표시
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import type { ConsultationData } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';
import { SectionNavigator } from './SectionNavigator';
import { SignupPromptModal } from './SignupPromptModal';
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
const LAST_SECTION = SECTION_COUNT - 1;
const SCROLL_LOCK_MS = 700;

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
  const sectionRefs = useRef<(HTMLDivElement | null)[]>(Array(SECTION_COUNT).fill(null));
  const currentIndexRef = useRef(currentSectionIndex);
  const scrollLocked = useRef(false);

  const { isLoggedIn, loginWithKakao, loginWithGoogle } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  /** 세션 중 모달을 이미 보여줬으면 다시 보여주지 않음 */
  const modalShownRef = useRef(false);

  /** currentSectionIndex가 바뀔 때 ref 동기화 + 마지막 섹션 도달 감지 */
  useEffect(() => {
    currentIndexRef.current = currentSectionIndex;

    if (
      currentSectionIndex === LAST_SECTION &&
      !isLoggedIn &&
      !modalShownRef.current
    ) {
      modalShownRef.current = true;
      // 섹션 전환 애니메이션이 끝난 후 모달 표시
      const timer = setTimeout(() => setShowSignupModal(true), 600);
      return () => clearTimeout(timer);
    }
  }, [currentSectionIndex, isLoggedIn]);

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

  /** 섹션으로 스크롤 (nav 클릭 + 휠 공용) */
  const handleNavigate = useCallback((index: number) => {
    const container = containerRef.current;
    const section = sectionRefs.current[index];
    if (!container || !section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    container.scrollTo({
      top: section.offsetTop,
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
    });
  }, []);

  /**
   * 마우스 휠 핸들러
   * - e.preventDefault()로 브라우저 기본 스크롤 차단
   * - SCROLL_LOCK_MS 동안 락을 걸어 한 번에 한 섹션씩만 이동
   * - deltaMode 정규화: line(1) → ×40, page(2) → ×800
   * - |dy| < 20 이하의 트랙패드 관성 스크롤은 무시
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (scrollLocked.current) return;

      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 40;
      if (e.deltaMode === 2) dy *= 800;

      if (Math.abs(dy) < 20) return;

      const direction = dy > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(LAST_SECTION, currentIndexRef.current + direction));
      if (next === currentIndexRef.current) return;

      scrollLocked.current = true;
      handleNavigate(next);
      setTimeout(() => { scrollLocked.current = false; }, SCROLL_LOCK_MS);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleNavigate]);

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
            className="h-screen overflow-y-auto bg-night-900 flex flex-col justify-center"
            style={{ scrollSnapAlign: 'start' }}
            data-testid={`fullpage-section-${index}`}
          >
            <div className="max-w-3xl mx-auto px-4 py-8 w-full">
              <SectionTitle label={label} />
              {sections[index]}
              {/* 마지막 섹션(월별운세)에 피드백 버튼 */}
              {index === LAST_SECTION && (
                <div className="mt-8">
                  <FeedbackButton feedbackType="CONSULTATION" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 회원가입 유도 모달 */}
      {showSignupModal && (
        <SignupPromptModal
          onKakao={() => { setShowSignupModal(false); loginWithKakao(); }}
          onGoogle={() => { setShowSignupModal(false); loginWithGoogle(); }}
          onClose={() => setShowSignupModal(false)}
        />
      )}
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
