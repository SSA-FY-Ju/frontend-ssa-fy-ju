'use client';

/**
 * 기업 궁합 분석 풀페이지 뷰
 *
 * 섹션 구성:
 *   1. 시너지 점수 (potentialSynergy)
 *   2. 장기 안정성 (longTermStability)
 *   3. 면접 키워드 (actionableStrategy.interviewKeywords)
 *   4. 약점 방어 전략 (actionableStrategy.weaknessDefense)
 *   5. 면접 최적 시기 (actionableStrategy.bestTiming.luckyDays)
 */

import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import type { CompatibilityResult } from '@/types/api';

import 'swiper/css';

const SECTIONS = [
  { key: 'synergy',   label: '시너지',    subtitle: '함께할 때 빛나는 가능성',      color: '#f59e0b' },
  { key: 'stability', label: '안정성',    subtitle: '긴 시간이 증명하는 인연',      color: '#8b5cf6' },
  { key: 'keywords',  label: '면접 키워드', subtitle: '별이 속삭이는 당신의 언어',  color: '#06b6d4' },
  { key: 'defense',   label: '약점 전략', subtitle: '약점을 강점으로 바꾸는 법',    color: '#34d399' },
  { key: 'timing',    label: '최적 시기', subtitle: '운이 열리는 날들',             color: '#f87171' },
] as const;

interface FullPageCompatibilityProps {
  result: CompatibilityResult;
  companyName: string;
  onReset: () => void;
  onSectionChange?: (index: number) => void;
}

export function FullPageCompatibility({ result, companyName, onReset, onSectionChange }: FullPageCompatibilityProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
    onSectionChange?.(swiper.activeIndex);
  };

  const navigateTo = (index: number) => swiperRef.current?.slideTo(index);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <RightNavigator sections={SECTIONS} activeIndex={activeIndex} onNavigate={navigateTo} />

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
        {/* 1. 시너지 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[0]}>
            <ScoreSection
              score={result.potentialSynergy}
              companyName={companyName}
              description="사주가 말하는 당신과 이 기업의 에너지 궁합"
              color={SECTIONS[0].color}
              onReset={onReset}
            />
          </SlideShell>
        </SwiperSlide>

        {/* 2. 안정성 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[1]}>
            <ScoreSection
              score={result.longTermStability}
              companyName={companyName}
              description="오랜 시간 함께했을 때의 운명적 안정도"
              color={SECTIONS[1].color}
            />
          </SlideShell>
        </SwiperSlide>

        {/* 3. 면접 키워드 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[2]}>
            <KeywordsSection keywords={result.actionableStrategy.interviewKeywords} color={SECTIONS[2].color} />
          </SlideShell>
        </SwiperSlide>

        {/* 4. 약점 방어 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[3]}>
            <DefenseSection text={result.actionableStrategy.weaknessDefense} color={SECTIONS[3].color} />
          </SlideShell>
        </SwiperSlide>

        {/* 5. 최적 시기 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[4]}>
            <TimingSection luckyDays={result.actionableStrategy.bestTiming.luckyDays} color={SECTIONS[4].color} />
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
  const idx = SECTIONS.findIndex((s) => s.key === section.key);
  void scrollable; // scrollable prop reserved for future use

  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      background: `radial-gradient(ellipse at 80% 20%, ${section.color}10 0%, transparent 60%)`,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      paddingTop: '4rem', paddingBottom: '2rem', boxSizing: 'border-box',
    }}>
      <div className="max-w-3xl mx-auto px-4 py-8 w-full">
        <div style={{ marginBottom: 32 }}>
          <p style={{
            color: section.color, opacity: 0.6, fontSize: 11, fontWeight: 800,
            letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ opacity: 0.8 }}>✦</span>
            <span style={{ letterSpacing: '0.18em' }}>&mdash;&nbsp;{String(idx + 1).padStart(2, '0')}&nbsp;&mdash;</span>
            <span style={{ opacity: 0.8 }}>✦</span>
          </p>
          <h2 className="font-black text-white tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.1, marginBottom: 10 }}>
            {section.label}
          </h2>
          <p style={{ fontSize: '0.82rem', color: section.color, opacity: 0.7, fontStyle: 'italic', letterSpacing: '0.04em', marginBottom: 16 }}>
            {section.subtitle}
          </p>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${section.color}99 0%, ${section.color}22 50%, transparent 100%)` }} />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── 점수 섹션 ─────────────────────────────────── */

function ScoreSection({
  score, companyName, description, color, onReset,
}: {
  score: number; companyName: string;
  description: string; color: string; onReset?: () => void;
}) {
  const grade = score >= 80 ? '최상' : score >= 60 ? '양호' : score >= 40 ? '보통' : '주의';
  const gradeColor = score >= 80 ? '#f59e0b' : score >= 60 ? '#22c55e' : score >= 40 ? '#06b6d4' : '#ef4444';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - score / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      {/* 기업명 */}
      <p style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textShadow: `0 0 40px ${color}44` }}>
        {companyName}
      </p>

      {/* 원형 점수 게이지 */}
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="70" cy="70" r="54" fill="none"
            stroke={gradeColor} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 8px ${gradeColor}88)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>/ 100</span>
        </div>
      </div>

      {/* 등급 + 설명 */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          display: 'inline-block', padding: '4px 16px', borderRadius: 999,
          background: `${gradeColor}22`, border: `1px solid ${gradeColor}55`,
          color: gradeColor, fontSize: 13, fontWeight: 800, marginBottom: 12,
        }}>{grade}</span>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{description}</p>
      </div>

      {/* 다시 분석 버튼 (첫 섹션에만) */}
      {onReset && (
        <button
          onClick={onReset}
          style={{
            padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer',
          }}
        >
          다시 분석하기
        </button>
      )}

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>
        스크롤로 자세한 분석 보기 ↓
      </p>
    </div>
  );
}

/* ── 면접 키워드 섹션 ──────────────────────────── */

function KeywordsSection({ keywords, color }: { keywords: string[]; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 8 }}>
        면접에서 이 키워드를 활용하면 별의 기운이 더해집니다
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {keywords.map((kw, i) => (
          <span
            key={i}
            style={{
              padding: '8px 16px', borderRadius: 999,
              background: `${color}18`, border: `1px solid ${color}44`,
              color, fontSize: 14, fontWeight: 700,
              boxShadow: `0 0 12px ${color}22`,
            }}
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── 약점 방어 전략 섹션 ───────────────────────── */

function DefenseSection({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <span aria-hidden="true" style={{
        position: 'absolute', top: -20, left: -8, fontSize: 80, lineHeight: 1,
        color, opacity: 0.08, fontFamily: 'serif', fontWeight: 900, userSelect: 'none',
      }}>"</span>
      <p style={{
        fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'rgba(255,255,255,0.88)',
        lineHeight: 2, fontStyle: 'italic', paddingLeft: 4, paddingTop: 16,
      }}>
        {text}
      </p>
    </div>
  );
}

/* ── 최적 시기 섹션 ────────────────────────────── */

function TimingSection({ luckyDays, color }: { luckyDays: string[]; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 8 }}>
        별자리가 가장 밝게 빛나는 날, 면접을 잡으세요
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {luckyDays.map((day, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px', borderRadius: 12,
              background: `${color}0e`, border: `1px solid ${color}2a`,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>🌙</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 우측 네비게이터 ───────────────────────────── */

function RightNavigator({
  sections, activeIndex, onNavigate,
}: {
  sections: typeof SECTIONS; activeIndex: number; onNavigate: (i: number) => void;
}) {
  return (
    <>
      <nav aria-label="섹션 네비게이터" className="hidden lg:flex flex-col gap-1 fixed right-5 top-1/2 -translate-y-1/2 z-40">
        {sections.map((section, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={section.key} onClick={() => onNavigate(i)}
              aria-label={`${section.label} 섹션으로 이동`}
              aria-current={isActive ? 'true' : undefined}
              className="flex items-center gap-2 group py-1 focus:outline-none"
            >
              <span className={['text-xs font-medium whitespace-nowrap transition-colors duration-200 text-right', isActive ? 'text-star-400' : 'text-gray-300/45 group-hover:text-star-300'].join(' ')}>
                {section.label}
              </span>
              <span className={['text-star-400 text-sm transition-opacity duration-200 w-4 text-center', isActive ? 'opacity-100' : 'opacity-0'].join(' ')}>
                🌙
              </span>
            </button>
          );
        })}
      </nav>

      <nav aria-label="섹션 빠른 이동" className="lg:hidden sticky top-0 z-40 bg-night-900/95 backdrop-blur-sm border-b border-night-800 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max px-3 py-0.5">
          {sections.map((section, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={section.key} onClick={() => onNavigate(i)}
                aria-current={isActive ? 'true' : undefined}
                className={['relative px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors duration-200 min-h-[44px] flex items-center', isActive ? 'text-star-400' : 'text-gray-300/45 hover:text-star-300'].join(' ')}
              >
                {section.label}
                {isActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-star-500 rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
