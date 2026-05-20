'use client';

/**
 * AI 커리어 컨설팅 풀페이지 뷰
 *
 * 섹션 구성:
 *   1. 종합 분석 요약  (analysisSummary)
 *   2. 운명의 전환점   (pivotPoints — 타임라인)
 *   3. 주의 시기       (warningMonths + warningDescription)
 */

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import type { ConsultationData, PivotPoint } from '@/types/api';
import { SectionNavigator } from './SectionNavigator';

import 'swiper/css';

const SECTIONS = [
  { key: 'summary',  label: '종합 분석', subtitle: '사주가 그리는 당신의 커리어',   color: '#8b5cf6' },
  { key: 'pivots',   label: '전환점',    subtitle: '별이 정한 운명의 분기점들',      color: '#f59e0b' },
  { key: 'warning',  label: '주의 시기', subtitle: '지혜로운 자는 피할 줄 안다',    color: '#f87171' },
] as const;

interface FullPageConsultationProps {
  data: ConsultationData;
  currentSectionIndex: number;
  onSectionChange: (index: number) => void;
}

export function FullPageConsultation({ data, currentSectionIndex, onSectionChange }: FullPageConsultationProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="relative">
      <SectionNavigator
        sections={SECTIONS.map((s) => s.label)}
        currentIndex={currentSectionIndex}
        onNavigate={(i) => swiperRef.current?.slideTo(i)}
      />

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
          // 마운트 즉시 포커스 → mousewheel 이벤트 바로 수신
          (swiper.el as HTMLElement).focus({ preventScroll: true });
        }}
        onSlideChange={(swiper) => onSectionChange(swiper.activeIndex)}
        style={{ height: '100vh', willChange: 'transform' }}
        tabIndex={0}
        data-testid="fullpage-container"
      >
        {SECTIONS.map((section, index) => (
          <SwiperSlide key={section.key} style={{ height: '100vh', overflow: 'hidden' }} data-testid={`fullpage-section-${index}`}>
            <SlideShell section={section} index={index}>
              {index === 0 && <SummarySection text={data.analysisSummary} color={section.color} />}
              {index === 1 && <PivotsSection pivots={data.pivotPoints} color={section.color} />}
              {index === 2 && <WarningSection months={data.warningMonths} description={data.warningDescription} color={section.color} />}
            </SlideShell>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

/* ── 공통 슬라이드 쉘 ─────────────────────────────── */

function SlideShell({
  section, index, children,
}: {
  section: (typeof SECTIONS)[number];
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      height: '100vh', overflowY: 'auto',
      background: `radial-gradient(ellipse at 75% 20%, ${section.color}0d 0%, transparent 60%)`,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      paddingTop: '4rem', paddingBottom: '2rem', boxSizing: 'border-box',
    }}>
      <div className="max-w-3xl mx-auto px-4 py-8 w-full">
        {/* 섹션 헤더 */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            color: section.color, opacity: 0.6, fontSize: 11, fontWeight: 800,
            letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ opacity: 0.8 }}>✦</span>
            <span>&mdash;&nbsp;{String(index + 1).padStart(2, '0')}&nbsp;&mdash;</span>
            <span style={{ opacity: 0.8 }}>✦</span>
          </p>
          <h2 className="font-black text-white tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.1, marginBottom: 10 }}>
            {section.label}
          </h2>
          <p style={{ fontSize: '0.82rem', color: section.color, opacity: 0.7, fontStyle: 'italic', letterSpacing: '0.04em', marginBottom: 16 }}>
            {section.subtitle}
          </p>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${section.color}99, ${section.color}22, transparent)` }} />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── 1. 종합 분석 요약 ───────────────────────────── */

function SummarySection({ text, color }: { text: string; color: string }) {
  // 문장 분리
  const sentences = text.split(/(?<=[.。])\s+/).map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ position: 'relative' }}>
      {/* 인용 부호 장식 */}
      <span aria-hidden="true" style={{
        position: 'absolute', top: -24, left: -4,
        fontSize: 96, lineHeight: 1, color, opacity: 0.07,
        fontFamily: 'serif', fontWeight: 900, userSelect: 'none', pointerEvents: 'none',
      }}>"</span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
        {sentences.map((sentence, i) => (
          <p
            key={i}
            className="animate-item"
            style={{
              fontSize: i === 0 ? 'clamp(1rem, 2.4vw, 1.15rem)' : '0.925rem',
              color: i === 0 ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.62)',
              lineHeight: 1.85,
              fontStyle: i === 0 ? 'normal' : 'italic',
              paddingLeft: 4,
              animationDelay: `${i * 0.12}s`,
            }}
          >
            {sentence}
          </p>
        ))}
      </div>

      {/* 하단 서명 */}
      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ height: 1, width: 32, background: `${color}66` }} />
        <span style={{ fontSize: 11, color: `${color}88`, letterSpacing: '0.18em' }}>AI 커리어 컨설팅</span>
      </div>
    </div>
  );
}

/* ── 2. 전환점 타임라인 ──────────────────────────── */

function getPivotStyle(type: string) {
  switch (type.toUpperCase()) {
    case 'LUCKY':   return { color: '#34d399', label: '길(吉)', dot: '#34d399' };
    case 'CAUTION': return { color: '#f87171', label: '흉(凶)', dot: '#f87171' };
    default:        return { color: '#94a3b8', label: '보통',   dot: '#94a3b8' };
  }
}

function PivotsSection({ pivots, color }: { pivots: PivotPoint[]; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {pivots.map((pt, i) => {
        const style = getPivotStyle(pt.type);
        const circumference = 2 * Math.PI * 14;
        const offset = circumference * (1 - pt.score / 100);

        return (
          <div key={i} className="animate-item" style={{ display: 'flex', gap: 16, animationDelay: `${i * 0.1}s` }}>
            {/* 타임라인 라인 + 도트 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                background: style.dot,
                boxShadow: `0 0 8px ${style.dot}88`,
                marginTop: 4,
              }} />
              {i < pivots.length - 1 && (
                <div style={{ width: 1, flex: 1, minHeight: 20, background: `${color}22`, margin: '4px 0' }} />
              )}
            </div>

            {/* 내용 */}
            <div style={{ paddingBottom: i < pivots.length - 1 ? 20 : 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{pt.month}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                  background: `${style.color}18`, border: `1px solid ${style.color}44`, color: style.color,
                }}>
                  {style.label}
                </span>
              </div>

              {/* 점수 미니 게이지 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <svg width="36" height="36" style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke={style.color} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <span style={{ fontSize: 22, fontWeight: 900, color: style.color, lineHeight: 1 }}>{pt.score}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', alignSelf: 'flex-end', marginBottom: 2 }}>/ 100</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                {pt.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 3. 주의 시기 ────────────────────────────────── */

function WarningSection({ months, description, color }: { months: string[]; description: string; color: string }) {
  const sentences = description.split(/(?<=[.。])\s+/).map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 주의 달 태그 */}
      <div className="animate-item" style={{ animationDelay: '0s' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
          피해야 할 시기
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {months.map((m, i) => (
            <span
              key={i}
              style={{
                fontSize: 12, fontWeight: 700,
                padding: '6px 14px', borderRadius: 999,
                background: `${color}14`, border: `1px solid ${color}44`,
                color,
              }}
            >
              ⚠ {m}
            </span>
          ))}
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: `linear-gradient(90deg, ${color}33, transparent)` }} />

      {/* 경고 설명 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sentences.map((sentence, i) => (
          <p
            key={i}
            className="animate-item"
            style={{
              fontSize: '0.9rem',
              color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
              lineHeight: 1.8,
              animationDelay: `${0.1 + i * 0.12}s`,
            }}
          >
            {sentence}
          </p>
        ))}
      </div>
    </div>
  );
}
