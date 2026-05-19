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
import { SectionNavigator } from './SectionNavigator';
import { FeedbackPromptCard } from './FeedbackPromptCard';
import { IndustriesTab } from './IndustriesTab';
import { InterviewTipsTab } from './InterviewTipsTab';
import { StrengthsTab } from './StrengthsTab';
import { SajuProfileTab } from './SajuProfileTab';
import { WealthStyleTab } from './WealthStyleTab';
import { CareerRoadmapTab } from './CareerRoadmapTab';
import { BrandingTab } from './BrandingTab';
import { MonthlyForecastTab } from './MonthlyForecastTab';

const SECTIONS = [
  {
    label: '추천산업',
    icon: '🏢',
    accentColor: '#10b981',
    accentBg: 'rgba(16,185,129,0.06)',
    subtitle: '당신의 사주가 빛나는 무대',
  },
  {
    label: '면접팁',
    icon: '💬',
    accentColor: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.06)',
    subtitle: '천기가 내린 면접의 비결',
  },
  {
    label: '강점',
    icon: '⚡',
    accentColor: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.06)',
    subtitle: '하늘이 새긴 타고난 재능',
  },
  {
    label: '사주프로필',
    icon: '✦',
    accentColor: '#8b5cf6',
    accentBg: 'rgba(139,92,246,0.06)',
    subtitle: '운명의 근원, 당신의 일주',
  },
  {
    label: '부의운',
    icon: '💰',
    accentColor: '#eab308',
    accentBg: 'rgba(234,179,8,0.06)',
    subtitle: '재성이 흐르는 방향',
  },
  {
    label: '경력로드맵',
    icon: '🗺️',
    accentColor: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.06)',
    subtitle: '별이 인도하는 성장의 길',
  },
  {
    label: '브랜딩',
    icon: '✨',
    accentColor: '#f43f5e',
    accentBg: 'rgba(244,63,94,0.06)',
    subtitle: '세상에 보여줄 나만의 인상',
  },
  {
    label: '월별운세',
    icon: '🌙',
    accentColor: '#a855f7',
    accentBg: 'rgba(168,85,247,0.06)',
    subtitle: '달이 전하는 한 해의 흐름',
  },
] as const;

const SECTION_COUNT = SECTIONS.length;
const LAST_SECTION = SECTION_COUNT - 1;

interface FullPageConsultationProps {
  data: ConsultationData;
  currentSectionIndex: number;
  onSectionChange: (index: number) => void;
}

export function FullPageConsultation({
  data,
  currentSectionIndex,
  onSectionChange,
}: FullPageConsultationProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const feedbackShownRef = useRef(false);

  /** currentSectionIndex가 바뀔 때 마지막 섹션 도달 감지 → 피드백 카드 표시 */
  useEffect(() => {
    if (currentSectionIndex !== LAST_SECTION) return;
    if (feedbackShownRef.current) return;

    feedbackShownRef.current = true;
    const t = setTimeout(() => setShowFeedbackPrompt(true), 800);
    return () => clearTimeout(t);
  }, [currentSectionIndex]);

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
        sections={SECTIONS.map((s) => s.label)}
        currentIndex={currentSectionIndex}
        onNavigate={handleNavigate}
      />

      {/* Swiper 풀페이지 수직 슬라이더 */}
      <Swiper
        direction="vertical"
        slidesPerView={1}
        speed={900}
        modules={[Mousewheel, Keyboard, A11y]}
        mousewheel={{ thresholdDelta: 50, forceToAxis: true, releaseOnEdges: false }}
        keyboard={{ enabled: true }}
        a11y={{ enabled: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => onSectionChange(swiper.activeIndex)}
        style={{ height: '100vh', willChange: 'transform' }}
        data-testid="fullpage-container"
      >
        {SECTIONS.map((section, index) => (
          <SwiperSlide
            key={section.label}
            style={{ height: '100vh', overflow: 'hidden' }}
            data-testid={`fullpage-section-${index}`}
          >
            <div
              className="min-h-full flex flex-col justify-center"
              style={{
                height: '100vh',
                overflowY: 'auto',
                background: `radial-gradient(ellipse at 60% 30%, ${section.accentBg} 0%, transparent 65%)`,
              }}
            >
              <div className="max-w-3xl mx-auto px-4 py-8 w-full">
                <SectionTitle
                  label={section.label}
                  icon={section.icon}
                  accentColor={section.accentColor}
                  subtitle={section.subtitle}
                  index={index}
                />
                {slides[index]}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 피드백 유도 카드 (마지막 섹션 도달 시 슬라이드업) */}
      {showFeedbackPrompt && (
        <FeedbackPromptCard onClose={() => setShowFeedbackPrompt(false)} />
      )}
    </div>
  );
}

function SectionTitle({
  label,
  icon,
  accentColor,
  subtitle,
  index,
}: {
  label: string;
  icon: string;
  accentColor: string;
  subtitle: string;
  index: number;
}) {
  const num = String(index + 1).padStart(2, '0');

  return (
    <div className="mb-8">
      {/* Ornamental section counter: ✦ — 01 — ✦ */}
      <p
        style={{
          color: accentColor,
          opacity: 0.6,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ opacity: 0.8 }}>✦</span>
        <span style={{ letterSpacing: '0.18em' }}>
          &mdash;&nbsp;{num}&nbsp;&mdash;
        </span>
        <span style={{ opacity: 0.8 }}>✦</span>
      </p>

      {/* Main title row */}
      <div className="flex items-center gap-4 mb-3">
        <span aria-hidden="true" style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>
          {icon}
        </span>
        <h2
          className="font-black text-white tracking-tight"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.1 }}
        >
          {label}
        </h2>
      </div>

      {/* Subtitle / tagline */}
      <p
        style={{
          fontSize: '0.82rem',
          color: accentColor,
          opacity: 0.7,
          fontStyle: 'italic',
          letterSpacing: '0.04em',
          paddingLeft: 52, /* align with title text */
          marginBottom: 16,
        }}
      >
        {subtitle}
      </p>

      {/* Accent divider */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, ${accentColor}99 0%, ${accentColor}22 50%, transparent 100%)`,
        }}
      />
    </div>
  );
}
