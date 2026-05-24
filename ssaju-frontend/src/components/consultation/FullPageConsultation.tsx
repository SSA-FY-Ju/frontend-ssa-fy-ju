'use client';

/**
 * AI 커리어 컨설팅 풀페이지 뷰 (8섹션)
 *
 * 0. 핵심 분석      — favoredPeriod · confidenceScore · reasoning · strengths · cautions
 * 1. 사주 프로필    — sajuProfile (dayMaster · fiveElements · tenGods)
 * 2. 추천 산업      — industries[]
 * 3. 면접 전략      — interviewTips · powerKeywords
 * 4. 개인 브랜딩    — personalBranding
 * 5. 커리어 타임라인— careerTimeline (months · pivotPoints · warningMonths)
 * 6. 장기 로드맵    — longTermRoadmap
 * 7. 성향 & 케어    — workStyle · environmentFit · mentalCare · wealthStyle · relationshipStrategy
 */

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import type {
  ConsultationData,
  CareerPivotPoint,
  Industry,
  PowerKeywordItem,
} from '@/types/api';
import { SectionNavigator } from './SectionNavigator';

import 'swiper/css';

const SECTIONS = [
  { key: 'core',       label: '핵심 분석',      color: '#8b5cf6' },
  { key: 'saju',       label: '사주 프로필',    color: '#10b981' },
  { key: 'industry',   label: '추천 산업',      color: '#06b6d4' },
  { key: 'interview',  label: '면접 전략',      color: '#f59e0b' },
  { key: 'branding',   label: '개인 브랜딩',    color: '#ec4899' },
  { key: 'timeline',   label: '커리어 전환점',  color: '#ef4444' },
  { key: 'forecast',   label: '운세 & 주의',    color: '#f97316' },
  { key: 'roadmap',    label: '장기 로드맵',    color: '#3b82f6' },
  { key: 'workstyle',  label: '업무 & 환경',    color: '#a78bfa' },
  { key: 'mental',     label: '멘탈 케어',      color: '#ec4899' },
  { key: 'wealth',     label: '재무 & 인간관계', color: '#34d399' },
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
        speed={800}
        modules={[Mousewheel, Keyboard, A11y]}
        mousewheel={{ thresholdDelta: 50, forceToAxis: true, releaseOnEdges: false }}
        keyboard={{ enabled: true }}
        a11y={{ enabled: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          (swiper.el as HTMLElement).focus({ preventScroll: true });
        }}
        onSlideChange={(swiper) => onSectionChange(swiper.activeIndex)}
        style={{ height: '100vh', willChange: 'transform' }}
        tabIndex={0}
        data-testid="fullpage-container"
      >
        {SECTIONS.map((section, index) => (
          <SwiperSlide
            key={section.key}
            style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}
            data-testid={`fullpage-section-${index}`}
          >
            <SlideShell color={section.color} index={index} label={section.label}>
              {index === 0  && <CoreSection       data={data}                     color={section.color} />}
              {index === 1  && <SajuSection       profile={data.sajuProfile}      color={section.color} />}
              {index === 2  && <IndustrySection   industries={data.industries}    color={section.color} />}
              {index === 3  && <InterviewSection  data={data}                     color={section.color} />}
              {index === 4  && <BrandingSection   data={data}                     color={section.color} />}
              {index === 5  && <PivotSection      timeline={data.careerTimeline}  color={section.color} />}
              {index === 6  && <ForecastSection   timeline={data.careerTimeline}  color={section.color} />}
              {index === 7  && <RoadmapSection    data={data}                     color={section.color} />}
              {index === 8  && <WorkStyleSection  data={data}                     color={section.color} />}
              {index === 9  && <MentalSection     data={data}                     color={section.color} />}
              {index === 10 && <WealthSection     data={data}                     color={section.color} />}
            </SlideShell>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   공통: 슬라이드 쉘
──────────────────────────────────────────────────────────── */

function SlideShell({
  color, index, label, children,
}: {
  color: string;
  index: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 70% 10%, ${color}12 0%, transparent 55%)`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '5rem',
        paddingBottom: '3rem',
      }}
    >
      <div className="max-w-2xl mx-auto px-5 w-full">
        {/* 섹션 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span
            style={{
              fontSize: 10, fontWeight: 900, letterSpacing: '0.2em',
              padding: '3px 10px', borderRadius: 999,
              background: `${color}18`, border: `1px solid ${color}44`, color,
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
            {label}
          </span>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}44, transparent)` }} />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   0. 핵심 분석
──────────────────────────────────────────────────────────── */

function CoreSection({ data, color }: { data: ConsultationData; color: string }) {
  const period = data.favoredPeriod === 'H1' ? '상반기' : data.favoredPeriod === 'H2' ? '하반기' : data.favoredPeriod;
  const score = Math.round(data.confidenceScore);
  const C = 2 * Math.PI * 40;
  const offset = C * (1 - score / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 히어로 */}
      <div
        style={{
          padding: '28px 24px',
          borderRadius: 20,
          background: `linear-gradient(135deg, ${color}14 0%, ${color}06 100%)`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 140 }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
            채용 운이 열리는 시기
          </p>
          <p
            className="font-black"
            style={{
              fontSize: 'clamp(2.4rem, 8vw, 3.2rem)',
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              textShadow: `0 0 40px ${color}55`,
            }}
          >
            {period}
          </p>
        </div>
        {/* 신뢰도 링 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>신뢰도</p>
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
              <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="7"
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 분석 요약 */}
      {data.analysisSummary && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: `${color}0c`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, flex: 1 }}>{data.analysisSummary}</p>
          {data.openaiModelVersion && (
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', flexShrink: 0 }}>{data.openaiModelVersion}</span>
          )}
        </div>
      )}

      {/* 분석 근거 */}
      <div>
        <Label color={color}>분석 근거</Label>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.85 }}>{data.reasoning}</p>
      </div>

      <Divider color={color} />

      {/* 강점 / 주의 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <Label color="#34d399">강점</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.strengths.map((s, i) => (
              <Chip key={i} color="#34d399">{s}</Chip>
            ))}
          </div>
        </div>
        <div>
          <Label color="#f87171">주의사항</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.cautions.map((c, i) => (
              <p key={i} style={{ fontSize: 12, color: 'rgba(248,113,113,0.8)', lineHeight: 1.6 }}>⚠ {c}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   1. 사주 프로필
──────────────────────────────────────────────────────────── */

const ELEMENT_COLOR: Record<string, string> = {
  '木': '#34d399', '火': '#f87171', '土': '#fbbf24', '金': '#94a3b8', '水': '#60a5fa',
};

function SajuSection({ profile, color }: { profile: ConsultationData['sajuProfile']; color: string }) {
  const total = Object.values(profile.fiveElements).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 일간 히어로 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: `radial-gradient(circle, ${color}28, ${color}08)`,
            border: `2px solid ${color}55`,
            boxShadow: `0 0 30px ${color}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 38, fontWeight: 900, color, fontFamily: 'serif' }}>{profile.dayMaster}</span>
        </div>
        <div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>일간 (日干)</p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75 }}>{profile.dayMasterDescription}</p>
        </div>
      </div>

      <Divider color={color} />

      {/* 오행 분포 */}
      <div>
        <Label color={color}>오행 분포</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(profile.fiveElements).map(([el, val]) => {
            const pct = Math.round((val / total) * 100);
            const c = ELEMENT_COLOR[el] || color;
            return (
              <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 22, fontSize: 14, fontWeight: 900, color: c, textAlign: 'center', fontFamily: 'serif', flexShrink: 0 }}>{el}</span>
                <div style={{ flex: 1, height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${c}, ${c}aa)`, borderRadius: 999, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', minWidth: 20, textAlign: 'right' }}>{val}</span>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>{profile.fiveElementsAnalysis}</p>
      </div>

      <Divider color={color} />

      {/* 십신 */}
      <div>
        <Label color={color}>십신 분포</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {Object.entries(profile.tenGodDistribution).map(([god, val]) => (
            <div
              key={god}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 10,
                background: `${color}0e`, border: `1px solid ${color}2a`,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 900, color, fontFamily: 'serif' }}>{god}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>×{val}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>핵심</span>
          {profile.keyTenGods.map((god, i) => (
            <span
              key={i}
              style={{
                fontSize: 13, fontWeight: 900, padding: '4px 14px', borderRadius: 999,
                background: `${color}1a`, border: `1.5px solid ${color}55`, color, fontFamily: 'serif',
                boxShadow: `0 0 10px ${color}22`,
              }}
            >
              {god}
            </span>
          ))}
        </div>

        {/* 십신 특성 설명 */}
        {profile.tenGodCharacteristics && Object.keys(profile.tenGodCharacteristics).length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile.keyTenGods
              .filter((god) => profile.tenGodCharacteristics![god])
              .map((god) => (
                <div
                  key={god}
                  style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: `${color}08`, border: `1px solid ${color}20`,
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 900, color, fontFamily: 'serif', marginBottom: 4 }}>{god}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{profile.tenGodCharacteristics![god]}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   2. 추천 산업
──────────────────────────────────────────────────────────── */

function IndustrySection({ industries, color }: { industries: Industry[]; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {industries.map((ind, i) => (
        <div
          key={i}
          style={{
            padding: '20px 22px', borderRadius: 18,
            background: `${color}08`, border: `1px solid ${color}25`,
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* 번호 워터마크 */}
          <span
            style={{
              position: 'absolute', top: 10, right: 16,
              fontSize: 48, fontWeight: 900, color: `${color}0a`,
              lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}` }} />
            <p style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{ind.name}</p>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 14 }}>{ind.reason}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ind.recommendedRoles.map((role, j) => (
              <span
                key={j}
                style={{
                  fontSize: 11, padding: '3px 11px', borderRadius: 999,
                  background: `${color}14`, border: `1px solid ${color}33`, color,
                }}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   3. 면접 전략
──────────────────────────────────────────────────────────── */

function InterviewSection({ data, color }: { data: ConsultationData; color: string }) {
  const { interviewTips, powerKeywords } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 면접 팁 */}
      <div>
        <Label color={color}>면접 팁</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {interviewTips.map((tip, i) => (
            <div
              key={i}
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                style={{
                  flexShrink: 0, fontSize: 10, fontWeight: 900, color,
                  width: 22, height: 22, borderRadius: 6,
                  background: `${color}18`, border: `1px solid ${color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <Divider color={color} />

      {/* 파워 키워드 */}
      <div>
        <Label color={color}>파워 키워드</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {powerKeywords.keywords.map((kw: PowerKeywordItem, i: number) => (
            <div
              key={i}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '12px 14px', borderRadius: 12,
                background: `${color}07`, border: `1px solid ${color}1a`,
              }}
            >
              <span
                style={{
                  fontSize: 10, fontWeight: 900, color, flexShrink: 0,
                  padding: '2px 8px', borderRadius: 6,
                  background: `${color}1c`, border: `1px solid ${color}3a`,
                }}
              >
                {kw.element}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{kw.keyword}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>{kw.description}</p>
                <p style={{ fontSize: 10, color: `${color}88`, fontStyle: 'italic' }}>{kw.usageExample}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 10, fontSize: 11, color: 'rgba(248,113,113,0.65)' }}>⚠ {powerKeywords.avoidanceTip}</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   4. 개인 브랜딩
──────────────────────────────────────────────────────────── */

function BrandingSection({ data, color }: { data: ConsultationData; color: string }) {
  const { personalBranding, powerKeywords } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 태그라인 히어로 */}
      <div
        style={{
          padding: '24px 22px', borderRadius: 18,
          background: `linear-gradient(135deg, ${color}14, ${color}06)`,
          border: `1px solid ${color}30`,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 10, color: `${color}99`, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>이력서 태그라인</p>
        <p
          style={{
            fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 800,
            color: '#fff', fontStyle: 'italic', lineHeight: 1.5,
            textShadow: `0 0 20px ${color}44`,
          }}
        >
          "{personalBranding.taglineForResume}"
        </p>
      </div>

      {/* 브랜딩 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: '추천 컬러', value: personalBranding.suitColor, icon: '🎨' },
          { label: '첫인상 이미지', value: personalBranding.impression, icon: '✨' },
          { label: '스타일', value: personalBranding.hairAndMakeup, icon: '💫' },
          { label: '브랜딩 키워드', value: personalBranding.brandingKeyword, icon: '🔑' },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            style={{
              padding: '14px 16px', borderRadius: 14,
              background: `${color}08`, border: `1px solid ${color}1e`,
            }}
          >
            <p style={{ fontSize: 11, color: `${color}88`, marginBottom: 6 }}>{icon} {label}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontWeight: 600, lineHeight: 1.5 }}>{value}</p>
          </div>
        ))}
      </div>

      <Divider color={color} />

      {/* 키워드 활용 팁 */}
      <div>
        <Label color={color}>활용 가이드</Label>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 10 }}>{powerKeywords.selectionGuide}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {powerKeywords.usageTips.map((tip, i) => (
            <span
              key={i}
              style={{
                fontSize: 11, padding: '4px 12px', borderRadius: 999,
                background: `${color}0f`, border: `1px solid ${color}2a`, color: `${color}cc`,
              }}
            >
              ✓ {tip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   5. 커리어 전환점 (pivotPoints만)
──────────────────────────────────────────────────────────── */

const PIVOT_STYLE: Record<string, { color: string; label: string }> = {
  LUCKY:   { color: '#34d399', label: '길(吉)' },
  CAUTION: { color: '#f87171', label: '흉(凶)' },
  NORMAL:  { color: '#94a3b8', label: '보통'   },
};

function getPivotStyle(type: string) {
  return PIVOT_STYLE[type.toUpperCase()] ?? PIVOT_STYLE.NORMAL;
}

function PivotSection({ timeline, color }: { timeline: ConsultationData['careerTimeline']; color: string }) {
  const { pivotPoints } = timeline;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {pivotPoints.map((pt: CareerPivotPoint, i: number) => {
        const s = getPivotStyle(pt.type);
        return (
          <div key={i} style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}88`, marginTop: 4, flexShrink: 0 }} />
              {i < pivotPoints.length - 1 && (
                <div style={{ width: 1, flex: 1, minHeight: 24, background: `${color}28`, margin: '4px 0' }} />
              )}
            </div>
            <div style={{ paddingBottom: i < pivotPoints.length - 1 ? 18 : 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{pt.month}월</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 999, background: `${s.color}18`, border: `1px solid ${s.color}44`, color: s.color }}>
                  {s.label}
                </span>
                <span style={{ fontSize: 15, fontWeight: 900, color: s.color, marginLeft: 'auto' }}>{pt.score}</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>{pt.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   6. 운세 & 주의 (months + warningMonths)
──────────────────────────────────────────────────────────── */

function ForecastSection({ timeline, color }: { timeline: ConsultationData['careerTimeline']; color: string }) {
  const { months, warningMonths, warningDescription } = timeline;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 월별 운세 */}
      {months && Object.keys(months).length > 0 && (
        <div>
          <Label color={color}>월별 운세</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {Object.entries(months).map(([month, forecast]) => (
              <div
                key={month}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 72, flexShrink: 0 }}>{month}월</span>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{forecast.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Divider color="#f87171" />

      {/* 주의 시기 */}
      <div>
        <Label color="#f87171">피해야 할 시기</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {warningMonths.map((m, i) => (
            <span
              key={i}
              style={{
                fontSize: 12, fontWeight: 700, padding: '5px 13px', borderRadius: 999,
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.35)', color: '#f87171',
              }}
            >
              ⚠ {m}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.85 }}>{warningDescription}</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   6. 장기 로드맵
──────────────────────────────────────────────────────────── */

function RoadmapSection({ data, color }: { data: ConsultationData; color: string }) {
  const { longTermRoadmap } = data;
  const phases = [
    { label: '0 - 2년', phase: longTermRoadmap.phase0to2years, icon: '🌱' },
    { label: '3 - 5년', phase: longTermRoadmap.phase3to5years, icon: '🚀' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 단계별 카드 */}
      {phases.map(({ label, phase, icon }, i) => (
        <div
          key={i}
          style={{
            padding: '20px 22px', borderRadius: 18,
            background: `${color}09`, border: `1px solid ${color}22`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span
              style={{
                fontSize: 10, fontWeight: 900, color, padding: '3px 10px', borderRadius: 6,
                background: `${color}1e`, border: `1px solid ${color}3a`,
              }}
            >
              {label}
            </span>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{phase.goal}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row label="FOCUS" value={phase.focus} color={color} />
            <Row label="ACT"   value={phase.action} color={color} />
          </div>
        </div>
      ))}

      {/* 궁극의 목표 */}
      <div
        style={{
          padding: '22px 24px', borderRadius: 20,
          background: `linear-gradient(135deg, ${color}16, ${color}08)`,
          border: `1.5px solid ${color}38`,
          boxShadow: `0 0 30px ${color}14`,
        }}
      >
        <p style={{ fontSize: 10, color, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
          ✦ 궁극의 목표
        </p>
        <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
          {longTermRoadmap.ultimateGoal}
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>
          {longTermRoadmap.goalDescription}
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   8. 업무 & 환경
──────────────────────────────────────────────────────────── */

function WorkStyleSection({ data, color }: { data: ConsultationData; color: string }) {
  const { workStyle, environmentFit } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label color={color}>업무 스타일</Label>
        <MiniGrid color={color} items={[
          { label: '선호 기업',  value: workStyle.preferredCompanyType },
          { label: '리더십',    value: workStyle.leadershipType },
          { label: '의사결정',  value: workStyle.decisionMaking },
          { label: '갈등 해결', value: workStyle.conflictResolution },
        ]} />
      </div>
      <Divider color={color} />
      <div>
        <Label color={color}>근무환경 적합도</Label>
        <MiniGrid color={color} items={[
          { label: '조직 분위기', value: environmentFit.workVibe },
          { label: '기업 규모',  value: environmentFit.companySize },
          { label: '선호 동료',  value: environmentFit.colleagueType },
          { label: '물리적 환경', value: environmentFit.physicalEnv },
          { label: '문화 적합도', value: environmentFit.culturalFit },
          { label: '갈등 접근',  value: environmentFit.conflictApproach },
        ]} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   9. 멘탈 케어
──────────────────────────────────────────────────────────── */

function MentalSection({ data, color }: { data: ConsultationData; color: string }) {
  const { mentalCare } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TagRow label="스트레스 취약점" tags={mentalCare.stressVulnerability} tagColor="#f87171" />
      <TagRow label="충전 방법"      tags={mentalCare.rechargeMethod}      tagColor="#34d399" />
      <Divider color={color} />
      <InfoCard label="마음의 만트라"  value={`"${mentalCare.mindsetMantra}"`} color={color} italic />
      <InfoCard label="위기 대응 전술" value={mentalCare.emergencyTactic}      color="#f87171" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   10. 재무 & 인간관계
──────────────────────────────────────────────────────────── */

function WealthSection({ data, color }: { data: ConsultationData; color: string }) {
  const { wealthStyle, relationshipStrategy } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label color={color}>재무 스타일</Label>
        <MiniGrid color={color} items={[
          { label: '수입원',    value: wealthStyle.incomeSource },
          { label: '투자 성향', value: wealthStyle.investmentTendency },
          { label: '재무 조언', value: wealthStyle.financialAdvice },
          { label: '부가 수입', value: wealthStyle.additionalIncome },
        ]} />
      </div>
      <Divider color={color} />
      <div>
        <Label color={color}>인간관계 전략</Label>
        <MiniGrid color={color} items={[
          { label: '사교 스타일',    value: relationshipStrategy.socialStyle },
          { label: '네트워킹',      value: relationshipStrategy.networkingApproach },
          { label: '팀 내 역할',    value: relationshipStrategy.teamPosition },
          { label: '커리어 네트워크', value: relationshipStrategy.careerNetworking },
        ]} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   공통 서브 컴포넌트
──────────────────────────────────────────────────────────── */

function Label({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, color, letterSpacing: '0.18em', textTransform: 'uppercase',
      fontWeight: 800, marginBottom: 10,
    }}>
      {children}
    </p>
  );
}

function Divider({ color }: { color: string }) {
  return <div style={{ height: 1, background: `linear-gradient(90deg, ${color}44, transparent)` }} />;
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 12, padding: '4px 12px', borderRadius: 999,
      background: `${color}14`, border: `1px solid ${color}35`, color,
    }}>
      {children}
    </span>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <span style={{ fontSize: 10, color: `${color}88`, minWidth: 36, marginTop: 2, fontWeight: 700 }}>{label}</span>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>{value}</p>
    </div>
  );
}

function MiniGrid({ items, color }: { items: { label: string; value: string }[]; color: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {items.map(({ label, value }) => (
        <div
          key={label}
          style={{ padding: '10px 12px', borderRadius: 10, background: `${color}07`, border: `1px solid ${color}18` }}
        >
          <p style={{ fontSize: 9, color: `${color}88`, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', fontWeight: 500, lineHeight: 1.5 }}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function TagRow({ label, tags, tagColor }: { label: string; tags: string[]; tagColor: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 9, color: tagColor, letterSpacing: '0.1em', textTransform: 'uppercase', minWidth: 52, marginTop: 3, flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {tags.map((t, i) => (
          <span
            key={i}
            style={{
              fontSize: 11, padding: '2px 9px', borderRadius: 999,
              background: `${tagColor}12`, border: `1px solid ${tagColor}28`, color: tagColor,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ label, value, color, italic }: { label: string; value: string; color: string; italic?: boolean }) {
  return (
    <div style={{ padding: '10px 14px', borderRadius: 10, background: `${color}0a`, border: `1px solid ${color}22` }}>
      <p style={{ fontSize: 10, color: `${color}99`, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#fff', fontWeight: 600, lineHeight: 1.6, fontStyle: italic ? 'italic' : 'normal' }}>{value}</p>
    </div>
  );
}
