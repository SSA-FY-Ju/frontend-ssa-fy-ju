'use client';

/**
 * AI 컨설팅 풀페이지 뷰 (T065)
 *
 * Swiper.js v12으로 fullpage.js 동일 UX 구현
 * - 각 섹션 = 100vh 독립 전체 화면 (direction: "vertical")
 * - Mousewheel 모듈: 트랙패드/마우스 휠 자동 정규화, 한 번에 한 섹션씩 이동
 * - Keyboard 모듈: 위/아래 화살표 키 지원
 * - navigator 클릭: swiperRef.current?.slideTo(index)
 * - 마지막 섹션 최초 도달 시 비로그인 사용자에게 회원가입 모달 표시
 */

import { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
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
  const swiperRef = useRef<SwiperType | null>(null);

  const { isLoggedIn, loginWithKakao, loginWithGoogle } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  /** 세션 중 모달을 이미 보여줬으면 다시 보여주지 않음 */
  const modalShownRef = useRef(false);

  /** currentSectionIndex가 바뀔 때 마지막 섹션 도달 감지 */
  useEffect(() => {
    if (
      currentSectionIndex === LAST_SECTION &&
      !isLoggedIn &&
      !modalShownRef.current
    ) {
      modalShownRef.current = true;
      const timer = setTimeout(() => setShowSignupModal(true), 600);
      return () => clearTimeout(timer);
    }
  }, [currentSectionIndex, isLoggedIn]);

  /** 네비게이터 클릭 → Swiper 슬라이드 이동 */
  const handleNavigate = (index: number) => {
    swiperRef.current?.slideTo(index);
  };

  const slides = [
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

      {/* Swiper 풀페이지 수직 슬라이더 */}
      <Swiper
        direction="vertical"
        slidesPerView={1}
        speed={600}
        modules={[Mousewheel, Keyboard, A11y]}
        mousewheel={{ thresholdDelta: 20, forceToAxis: true }}
        keyboard={{ enabled: true }}
        a11y={{ enabled: true }}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={(swiper) => onSectionChange(swiper.activeIndex)}
        style={{ height: '100vh' }}
        data-testid="fullpage-container"
      >
        {SECTION_LABELS.map((label, index) => (
          <SwiperSlide
            key={label}
            style={{ height: '100vh', overflowY: 'auto' }}
            data-testid={`fullpage-section-${index}`}
          >
            <div className="bg-night-900 min-h-full flex flex-col justify-center">
              <div className="max-w-3xl mx-auto px-4 py-8 w-full">
                <SectionTitle label={label} />
                {slides[index]}
                {/* 마지막 섹션(월별운세)에 피드백 버튼 */}
                {index === LAST_SECTION && (
                  <div className="mt-8">
                    <FeedbackButton feedbackType="CONSULTATION" />
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

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
