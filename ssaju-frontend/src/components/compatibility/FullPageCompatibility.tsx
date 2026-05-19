'use client';

/**
 * 기업 궁합 분석 풀페이지 뷰
 *
 * Swiper 수직 슬라이드 — 섹션마다 100vh 독립 화면
 * consultation 페이지와 다른 디자인:
 *  - 네비게이터: 하단 중앙 수평 바
 *  - 섹션 번호: 우측 대형 텍스트 (에디토리얼 역배치)
 *  - accent 색상: 섹션별 독립 테마
 */

import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import type { CompatibilityResult } from '@/types/api';
import { CompatibilityScore } from '@/components/visualization/CompatibilityScore';
import { JobMatchingCards } from '@/components/visualization/JobMatchingCards';
import { MonthlyCalendar } from '@/components/visualization/MonthlyCalendar';

import 'swiper/css';

const SECTIONS = [
  {
    key: 'hero',
    label: '기업 개요',
    subtitle: '별빛이 닿은 기업과의 인연',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.06)',
  },
  {
    key: 'score',
    label: '궁합 점수',
    subtitle: '사주가 말하는 운명의 무게',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.06)',
  },
  {
    key: 'recommendation',
    label: '종합 평가',
    subtitle: '하늘이 전하는 한 마디',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.06)',
  },
  {
    key: 'jobs',
    label: '직무 매칭',
    subtitle: '당신이 빛나는 자리',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
  },
  {
    key: 'roadmap',
    label: '경력 로드맵',
    subtitle: '별이 그리는 성장의 궤적',
    color: '#c4b5fd',
    bg: 'rgba(196,181,253,0.06)',
  },
  {
    key: 'monthly',
    label: '월별 운세',
    subtitle: '달빛이 비추는 한 해',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
  },
] as const;

const MILESTONE_STAGES = [
  { key: 'shortTerm' as const, label: '단기', period: '0 — 3개월', numeral: '一', color: '#34d399' },
  { key: 'midTerm'   as const, label: '중기', period: '3 — 12개월', numeral: '二', color: '#22d3ee' },
  { key: 'longTerm'  as const, label: '장기', period: '1 — 3년',    numeral: '三', color: '#c4b5fd' },
];

interface FullPageCompatibilityProps {
  result: CompatibilityResult;
  onReset: () => void;
  onSectionChange?: (index: number) => void;
}

export function FullPageCompatibility({ result, onReset: _onReset, onSectionChange }: FullPageCompatibilityProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
    onSectionChange?.(swiper.activeIndex);
  };

  const navigateTo = (index: number) => {
    swiperRef.current?.slideTo(index);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* ── 우측 세로 네비게이터 ── */}
      <RightNavigator sections={SECTIONS} activeIndex={activeIndex} onNavigate={navigateTo} />

      {/* ── Swiper 풀페이지 ── */}
      <Swiper
        direction="vertical"
        slidesPerView={1}
        speed={750}
        modules={[Mousewheel, Keyboard, A11y]}
        mousewheel={{ thresholdDelta: 50, forceToAxis: true, releaseOnEdges: false }}
        keyboard={{ enabled: true }}
        a11y={{ enabled: true }}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={handleSlideChange}
        style={{ height: '100vh', willChange: 'transform' }}
      >
        {/* ── 슬라이드 1: 기업 히어로 ── */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[0]}>
            <HeroSection result={result} color={SECTIONS[0].color} />
          </SlideShell>
        </SwiperSlide>

        {/* ── 슬라이드 2: 궁합 점수 ── */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[1]}>
            <CompatibilityScore
              score={result.compatibilityScore}
              confidenceLevel={result.confidenceLevel}
              sipShinScore={result.sipShinScore}
              oHangScore={result.oHangScore}
              jijangGanScore={result.jijangGanScore}
              leadershipScore={result.leadershipScore}
            />
          </SlideShell>
        </SwiperSlide>

        {/* ── 슬라이드 3: 종합 평가 ── */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[2]}>
            <RecommendationSection text={result.recommendation} color={SECTIONS[2].color} />
          </SlideShell>
        </SwiperSlide>

        {/* ── 슬라이드 4: 직무 매칭 ── */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[3]} scrollable>
            <JobMatchingCards cards={result.jobMatchCards} />
          </SlideShell>
        </SwiperSlide>

        {/* ── 슬라이드 5: 경력 로드맵 ── */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[4]}>
            <RoadmapSection result={result} />
          </SlideShell>
        </SwiperSlide>

        {/* ── 슬라이드 6: 월별 운세 ── */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[5]} scrollable>
            <MonthlyForecastSection forecasts={result.monthlyForecasts} />
          </SlideShell>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

/* ── 공통 슬라이드 쉘 ─────────────────────────── */

function SlideShell({
  section,
  children,
  scrollable = false,
}: {
  section: (typeof SECTIONS)[number];
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  const idx = SECTIONS.indexOf(section);

  return (
    <div
      style={{
        height: '100vh',
        overflowY: scrollable ? 'auto' : 'hidden',
        background: `radial-gradient(ellipse at 80% 20%, ${section.bg} 0%, transparent 60%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '4rem',
        paddingBottom: '2rem',
        boxSizing: 'border-box',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-8 w-full">
        {/* ── 섹션 헤더 (consultation SectionTitle과 동일 구조) ── */}
        <div style={{ marginBottom: 32 }}>
          {/* 장식 카운터 */}
          <p style={{
            color: section.color,
            opacity: 0.6,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ opacity: 0.8 }}>✦</span>
            <span style={{ letterSpacing: '0.18em' }}>
              &mdash;&nbsp;{String(idx + 1).padStart(2, '0')}&nbsp;&mdash;
            </span>
            <span style={{ opacity: 0.8 }}>✦</span>
          </p>

          {/* 타이틀 행 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <h2 className="font-black text-white tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.1 }}>
              {section.label}
            </h2>
          </div>

          {/* 서브타이틀 */}
          <p style={{
            fontSize: '0.82rem',
            color: section.color,
            opacity: 0.7,
            fontStyle: 'italic',
            letterSpacing: '0.04em',
            marginBottom: 16,
          }}>
            {section.subtitle}
          </p>

          {/* 액센트 구분선 */}
          <div style={{
            height: 1,
            background: `linear-gradient(90deg, ${section.color}99 0%, ${section.color}22 50%, transparent 100%)`,
          }} />
        </div>

        {/* 콘텐츠 */}
        {children}
      </div>
    </div>
  );
}

/* ── 슬라이드 1: 기업 히어로 ─────────────────── */

function HeroSection({ result, color }: { result: CompatibilityResult; color: string }) {
  const score = result.compatibilityScore;
  const scoreColor = score >= 80 ? '#f59e0b' : score >= 60 ? '#22c55e' : '#ef4444';
  const grade = score >= 80 ? '최상' : score >= 60 ? '양호' : '보통';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* 기업명 */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color, opacity: 0.5, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          COMPATIBILITY TARGET
        </p>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-0.03em',
          textShadow: `0 0 60px ${color}44`,
          lineHeight: 1,
        }}>
          {result.companyName}
        </h1>
      </div>

      {/* 점수 요약 가로 카드 3개 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <MiniCard label="궁합 점수" value={`${score}점`} color={scoreColor} />
        <MiniCard label="등급" value={grade} color={scoreColor} />
        <MiniCard
          label="신뢰도"
          value={{ LOW: '낮음', MEDIUM: '보통', HIGH: '높음' }[result.confidenceLevel]}
          color={{ LOW: '#ef4444', MEDIUM: '#f59e0b', HIGH: '#22c55e' }[result.confidenceLevel]}
        />
      </div>

      {/* 스크롤 유도 */}
      <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
        스크롤 또는 ↓ 로 자세한 분석 보기
      </p>
    </div>
  );
}

function MiniCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '16px 12px',
      borderRadius: 14,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 900, color }}>{value}</p>
    </div>
  );
}

/* ── 슬라이드 3: 종합 평가 ────────────────────── */

function RecommendationSection({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* 장식 따옴표 */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -20,
          left: -8,
          fontSize: 80,
          lineHeight: 1,
          color,
          opacity: 0.1,
          fontFamily: 'serif',
          fontWeight: 900,
          userSelect: 'none',
        }}
      >
        "
      </span>
      <p style={{
        fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
        color: 'rgba(255,255,255,0.88)',
        lineHeight: 2,
        fontStyle: 'italic',
        paddingLeft: 4,
        paddingTop: 16,
      }}>
        {text}
      </p>
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          textAlign: 'right',
          fontSize: 80,
          lineHeight: 0.5,
          color,
          opacity: 0.1,
          fontFamily: 'serif',
          fontWeight: 900,
          marginTop: 8,
          userSelect: 'none',
        }}
      >
        "
      </span>
    </div>
  );
}

/* ── 슬라이드 6: 월별 운세 ──────────────────── */

const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

function MonthlyForecastSection({ forecasts }: { forecasts: CompatibilityResult['monthlyForecasts'] }) {
  const year = new Date().getFullYear();
  const moon = MOON_PHASES[new Date().getMonth() % 8];

  return (
    <div className="flex flex-col gap-6">
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingBottom: 20,
        borderBottom: '1px solid rgba(248,113,113,0.15)',
      }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#f87171', opacity: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
            {year}년 월별 운세
          </p>
          <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.01em' }}>
            별들이 전하는 한 해의 흐름
          </p>
        </div>
        <span style={{ fontSize: 44, lineHeight: 1, filter: 'drop-shadow(0 0 12px rgba(248,113,113,0.6))', flexShrink: 0 }}>
          {moon}
        </span>
      </div>
      <MonthlyCalendar forecasts={forecasts} />
    </div>
  );
}

/* ── 슬라이드 5: 경력 로드맵 ─────────────────── */

function RoadmapSection({ result }: { result: CompatibilityResult }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {MILESTONE_STAGES.map((stage, i) => (
        <div key={stage.key}>
          <div style={{ display: 'flex', gap: 20, padding: '20px 0' }}>
            {/* 좌측 */}
            <div style={{ flexShrink: 0, width: 56, textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: 28, fontWeight: 900, fontFamily: 'serif', color: stage.color, opacity: 0.45, lineHeight: 1, marginBottom: 4 }}>
                {stage.numeral}
              </span>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: stage.color, letterSpacing: '0.05em' }}>
                {stage.period}
              </span>
            </div>
            {/* 세로선 + 점 */}
            <div style={{ position: 'relative', flexShrink: 0, width: 1 }}>
              <div style={{ width: 1, height: '100%', background: `linear-gradient(180deg, ${stage.color}55, ${stage.color}11)` }} />
              <div style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                width: 7, height: 7, borderRadius: '50%',
                background: stage.color, boxShadow: `0 0 8px ${stage.color}`,
              }} />
            </div>
            {/* 본문 */}
            <div style={{ flex: 1, paddingTop: 6 }}>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.75 }}>
                {result.careerMilestone[stage.key]}
              </p>
            </div>
          </div>
          {i < MILESTONE_STAGES.length - 1 && (
            <div style={{ height: 1, background: 'rgba(6,182,212,0.07)', margin: '0 0 0 76px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── 우측 세로 네비게이터 (SectionNavigator와 동일 디자인) ── */

function RightNavigator({
  sections,
  activeIndex,
  onNavigate,
}: {
  sections: typeof SECTIONS;
  activeIndex: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <>
      {/* 데스크톱: 우측 고정 — consultation SectionNavigator와 동일 */}
      <nav
        aria-label="섹션 네비게이터"
        className="hidden lg:flex flex-col gap-1 fixed right-5 top-1/2 -translate-y-1/2 z-40"
      >
        {sections.map((section, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={section.key}
              onClick={() => onNavigate(i)}
              aria-label={`${section.label} 섹션으로 이동`}
              aria-current={isActive ? 'true' : undefined}
              className="flex items-center gap-2 group py-1 focus:outline-none"
            >
              {/* 달 모양 인디케이터 */}
              {/* 레이블 */}
              <span className={['text-xs font-medium whitespace-nowrap transition-colors duration-200 text-right', isActive ? 'text-star-400' : 'text-gray-300/45 group-hover:text-star-300'].join(' ')}>
                {section.label}
              </span>
              {/* 달 인디케이터 */}
              <span className={['text-star-400 text-sm transition-opacity duration-200 w-4 text-center', isActive ? 'opacity-100' : 'opacity-0'].join(' ')}>
                🌙
              </span>
            </button>
          );
        })}
      </nav>

      {/* 모바일: 상단 고정 가로 스크롤 — consultation과 동일 */}
      <nav
        aria-label="섹션 빠른 이동"
        className="lg:hidden sticky top-0 z-40 bg-night-900/95 backdrop-blur-sm border-b border-night-800 overflow-x-auto scrollbar-hide"
      >
        <div className="flex min-w-max px-3 py-0.5">
          {sections.map((section, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={section.key}
                onClick={() => onNavigate(i)}
                aria-current={isActive ? 'true' : undefined}
                className={['relative px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors duration-200 min-h-[44px] flex items-center', isActive ? 'text-star-400' : 'text-gray-300/45 hover:text-star-300'].join(' ')}
              >
                {section.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-star-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
