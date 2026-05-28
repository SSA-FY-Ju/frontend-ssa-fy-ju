'use client';

/**
 * 기업 궁합 분석 풀페이지 뷰
 *
 * 섹션 구성:
 *   1. 종합 점수   — compatibilityScore + analysisBreakdown 4개 바
 *   2. 직군 분석   — targetRoleAnalysis (matchScore, synergy, warning)
 *   3. 오행 분석   — fiveElementsAnalysis (user/company 오행 비교)
 *   4. 면접 준비   — expectedInterviewQuestions + roleCompatibilities
 *   5. 월별 운세   — monthlyForecasts
 *   6. 주의사항    — cautions
 */

import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import type { CompatibilityResult } from '@/types/api';

import 'swiper/css';

const SECTIONS = [
  { key: 'score',     label: '종합 점수',  subtitle: '사주가 말하는 당신과 이 기업의 에너지 궁합', color: '#f59e0b' },
  { key: 'role',      label: '직군 분석',  subtitle: '당신의 별자리가 이 직군과 만나는 방식',      color: '#06b6d4' },
  { key: 'ohang',     label: '오행 분석',  subtitle: '우주의 다섯 기운이 빚어낸 조화',             color: '#10b981' },
  { key: 'interview', label: '면접 준비',  subtitle: '별이 예고하는 면접의 흐름',                  color: '#8b5cf6' },
  { key: 'monthly',   label: '월별 운세',  subtitle: '시간이 열어주는 기회의 문',                  color: '#3b82f6' },
  { key: 'caution',   label: '주의사항',   subtitle: '별이 당부하는 말들',                         color: '#f87171' },
] as const;

interface FullPageCompatibilityProps {
  result: CompatibilityResult;
  companyName: string;
  hasFeedback: boolean;
  onFeedbackOpen: () => void;
}

export function FullPageCompatibility({ result, companyName, hasFeedback, onFeedbackOpen }: FullPageCompatibilityProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [feedbackCardVisible, setFeedbackCardVisible] = useState(false);
  const [feedbackCardDismissed, setFeedbackCardDismissed] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (activeIndex === SECTIONS.length - 1) {
      // 슬라이드 전환(800ms) + 여유(200ms) 후 카드 등장
      feedbackTimerRef.current = setTimeout(() => setFeedbackCardVisible(true), 1000);
    } else {
      setFeedbackCardVisible(false);
    }
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [activeIndex]);

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  };

  const navigateTo = (index: number) => swiperRef.current?.slideTo(index);

  return (
    <div
      style={{
        position: 'relative', width: '100%', height: '100vh', overflow: 'hidden',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
        willChange: 'opacity, transform',
      }}
    >
      <RightNavigator sections={SECTIONS} activeIndex={activeIndex} onNavigate={navigateTo} />

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
        onSlideChange={handleSlideChange}
        style={{ height: '100vh', willChange: 'transform' }}
      >
        {/* 1. 종합 점수 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[0]}>
            <ScoreSection
              score={result.compatibilityScore}
              companyName={companyName}
              breakdown={result.analysisBreakdown}
              summary={result.summary}
              color={SECTIONS[0].color}
            />
          </SlideShell>
        </SwiperSlide>

        {/* 2. 직군 분석 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[1]}>
            <RoleSection analysis={result.targetRoleAnalysis} color={SECTIONS[1].color} />
          </SlideShell>
        </SwiperSlide>

        {/* 3. 오행 분석 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[2]}>
            <OhangSection data={result.fiveElements} color={SECTIONS[2].color} />
          </SlideShell>
        </SwiperSlide>

        {/* 4. 면접 준비 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[3]} scrollable>
            <InterviewSection
              questions={result.expectedInterviewQuestions}
              roles={result.roleCompatibility}
              strategy={result.actionableStrategy}
              color={SECTIONS[3].color}
            />
          </SlideShell>
        </SwiperSlide>

        {/* 5. 월별 운세 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[4]} scrollable>
            <MonthlySection forecasts={result.monthlyForecast} bestTiming={result.actionableStrategy?.bestTiming} color={SECTIONS[4].color} />
          </SlideShell>
        </SwiperSlide>

        {/* 6. 주의사항 */}
        <SwiperSlide style={{ height: '100vh' }}>
          <SlideShell section={SECTIONS[5]}>
            <CautionSection cautions={result.cautions} color={SECTIONS[5].color} />
          </SlideShell>
        </SwiperSlide>
      </Swiper>

      {/* 피드백 floating 카드 — 마지막 섹션 도달 시 우측 하단에 표시 */}
      {!hasFeedback && !feedbackCardDismissed && (
        <div
          role="complementary"
          aria-label="피드백 요청"
          className="fixed bottom-6 right-6 z-50"
          style={{
            transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1)',
            opacity: feedbackCardVisible ? 1 : 0,
            transform: feedbackCardVisible ? 'translateY(0)' : 'translateY(20px)',
            pointerEvents: feedbackCardVisible ? 'auto' : 'none',
          }}
        >
          <div
            className="flex flex-col gap-3 rounded-2xl shadow-2xl p-4"
            style={{
              width: 240,
              background: 'rgba(10,12,28,0.97)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 18, color: '#a78bfa', filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.5))' }}>✦</span>
              <button
                onClick={() => setFeedbackCardDismissed(true)}
                aria-label="닫기"
                className="text-base leading-none transition-colors"
                style={{ color: 'rgba(148,163,184,0.45)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148,163,184,0.45)')}
              >×</button>
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-snug">이 결과에 대해 의견을 알려주세요</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(196,181,253,0.55)' }}>피드백이 서비스 개선에 도움이 됩니다</p>
            </div>
            <button
              onClick={onFeedbackOpen}
              className="w-full text-xs font-bold py-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(90deg, #6d28d9, #4f46e5)', color: '#fff', boxShadow: '0 0 10px rgba(109,40,217,0.4)' }}
            >
              의견 남기기
            </button>
          </div>
        </div>
      )}
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

  return (
    <div style={{
      height: '100vh',
      overflowY: scrollable ? 'auto' : 'hidden',
      background: `radial-gradient(ellipse at 80% 20%, ${section.color}10 0%, transparent 60%)`,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      paddingTop: '4rem', paddingBottom: '2rem', boxSizing: 'border-box',
    }}>
      <div
        className="animate-item max-w-3xl mx-auto px-4 py-8 w-full"
        style={idx === 0 ? { animationDelay: '0.3s' } : undefined}
      >
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

/* ── 1. 종합 점수 섹션 ─────────────────────────── */

function ScoreSection({
  score, companyName, breakdown, summary, color,
}: {
  score: number; companyName: string;
  breakdown: CompatibilityResult['analysisBreakdown'];
  summary?: string;
  color: string;
}) {
  const gradeColor = score >= 80 ? '#f59e0b' : score >= 60 ? '#22c55e' : score >= 40 ? '#06b6d4' : '#ef4444';
  const grade = score >= 80 ? '최상' : score >= 60 ? '양호' : score >= 40 ? '보통' : '주의';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - score / 100);

  const bars = [
    { label: '성향 일치도',  value: breakdown.characterMatch },
    { label: '잠재 시너지', value: breakdown.potentialSynergy },
    { label: '장기 안정성', value: breakdown.longTermStability },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 기업명 + 원형 게이지 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <p style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textShadow: `0 0 40px ${color}44` }}>
          {companyName}
        </p>
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle
              cx="70" cy="70" r="54" fill="none"
              stroke={gradeColor} strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>/ 100</span>
          </div>
        </div>
        <span style={{
          display: 'inline-block', padding: '4px 16px', borderRadius: 999,
          background: `${gradeColor}22`, border: `1px solid ${gradeColor}55`,
          color: gradeColor, fontSize: 13, fontWeight: 800,
        }}>{grade}</span>
      </div>

      {/* 세부 점수 바 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bars.map(({ label, value }) => {
          const barColor = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';
          return (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                <span style={{ color: barColor, fontWeight: 700 }}>{value}점</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${value}%`, height: '100%', background: barColor, borderRadius: 999, boxShadow: `0 0 6px ${barColor}66`, transition: 'width 0.7s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 한줄 요약 */}
      {summary && (
        <div style={{
          padding: '14px 18px', borderRadius: 12,
          background: `${color}0c`, border: `1px solid ${color}25`,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontStyle: 'italic' }}>
            {summary}
          </p>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', textAlign: 'center' }}>
        스크롤로 자세한 분석 보기 ↓
      </p>
    </div>
  );
}

/* ── 2. 직군 분석 섹션 ─────────────────────────── */

function RoleSection({ analysis, color }: { analysis: CompatibilityResult['targetRoleAnalysis']; color: string }) {
  const matchGrade = analysis.matchScore >= 80 ? '최상' : analysis.matchScore >= 60 ? '양호' : '보통';
  const gradeColor = analysis.matchScore >= 80 ? '#22c55e' : analysis.matchScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 직군 매칭 점수 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 20px', borderRadius: 14, background: `${color}10`, border: `1px solid ${color}22` }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 40, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{analysis.matchScore}</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>직군 매칭</p>
        </div>
        <div style={{ flex: 1, height: 1, background: `rgba(255,255,255,0.08)` }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: gradeColor, padding: '4px 14px', borderRadius: 999, background: `${gradeColor}20`, border: `1px solid ${gradeColor}44` }}>
          {matchGrade}
        </span>
      </div>

      {/* 시너지 */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>시너지</p>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75 }}>{analysis.synergy}</p>
      </div>

      {/* 주의 */}
      <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#f87171', opacity: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>주의</p>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>{analysis.warning}</p>
      </div>
    </div>
  );
}

/* ── 3. 오행 분석 섹션 ─────────────────────────── */

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#22c55e',
  '火': '#ef4444',
  '土': '#f59e0b',
  '金': '#e2e8f0',
  '水': '#3b82f6',
};

function OhangSection({ data, color }: { data: CompatibilityResult['fiveElements']; color: string }) {
  const elements = ['木', '火', '土', '金', '水'];
  const userEl = data?.userDistribution ?? {};
  const companyEl = data?.companyDistribution ?? {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 오행 비교 바 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {elements.map((el) => {
          const userVal = userEl[el] ?? 0;
          const companyVal = companyEl[el] ?? 0;
          const elColor = ELEMENT_COLORS[el] ?? color;
          const maxVal = Math.max(...elements.map((e) => Math.max(userEl[e] ?? 0, companyEl[e] ?? 0, 1)));

          return (
            <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 16, width: 24, textAlign: 'center', color: elColor }}>{el}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* 사용자 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 28 }}>나</span>
                  <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${(userVal / maxVal) * 100}%`, height: '100%', background: elColor, borderRadius: 999, opacity: 0.9 }} />
                  </div>
                  <span style={{ fontSize: 10, color: elColor, fontWeight: 700, width: 12 }}>{userVal}</span>
                </div>
                {/* 기업 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 28 }}>기업</span>
                  <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${(companyVal / maxVal) * 100}%`, height: '100%', background: elColor, borderRadius: 999, opacity: 0.5 }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, width: 12 }}>{companyVal}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 종합 분석 */}
      <div style={{ padding: '16px', borderRadius: 12, background: `${color}0a`, border: `1px solid ${color}22` }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 10 }}>종합 분석</p>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>{data?.synergyDescription}</p>
      </div>
    </div>
  );
}

/* ── 4. 면접 준비 섹션 ─────────────────────────── */

function InterviewSection({
  questions, roles, strategy, color,
}: {
  questions: CompatibilityResult['expectedInterviewQuestions'];
  roles: CompatibilityResult['roleCompatibility'];
  strategy?: CompatibilityResult['actionableStrategy'];
  color: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 면접 키워드 */}
      {strategy?.interviewKeywords && strategy.interviewKeywords.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 10 }}>핵심 키워드</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {strategy.interviewKeywords.map((kw, i) => (
              <span key={i} style={{
                padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: `${color}15`, border: `1px solid ${color}35`, color,
              }}>{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* 약점 방어 전략 */}
      {strategy?.weaknessDefense && (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#f87171', opacity: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>약점 방어 전략</p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>{strategy.weaknessDefense}</p>
        </div>
      )}

      {/* 예상 면접 질문 */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 12 }}>예상 면접 질문</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.map((q, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 10, background: `${color}0a`, border: `1px solid ${color}1a` }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color, opacity: 0.5, flexShrink: 0, paddingTop: 2 }}>Q{i + 1}</span>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65 }}>{q.question}</p>
              </div>
              {q.intent && (
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, paddingLeft: 24 }}>{q.intent}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 직군별 궁합 */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 12 }}>직군별 궁합</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {roles.map((role, i) => {
            const roleColor = role.score >= 80 ? '#22c55e' : role.score >= 60 ? '#f59e0b' : '#f87171';
            return (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ textAlign: 'center', minWidth: 36 }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: roleColor, lineHeight: 1 }}>{role.score}</p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>점</p>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{role.roleName}</p>
                    {role.tag && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${roleColor}20`, color: roleColor }}>{role.tag}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{role.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── 5. 월별 운세 섹션 ─────────────────────────── */

function MonthlySection({
  forecasts, bestTiming, color,
}: {
  forecasts: CompatibilityResult['monthlyForecast'];
  bestTiming?: NonNullable<CompatibilityResult['actionableStrategy']>['bestTiming'];
  color: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* 행운의 날 + 시간대 */}
      {bestTiming && (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: `${color}0c`, border: `1px solid ${color}25`, marginBottom: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color, opacity: 0.55, textTransform: 'uppercase', marginBottom: 10 }}>행운의 날</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: bestTiming.preferredTime ? 10 : 0 }}>
            {bestTiming.luckyDays.map((day: string, i: number) => (
              <span key={i} style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: `${color}18`, border: `1px solid ${color}35`, color,
              }}>{day}</span>
            ))}
          </div>
          {bestTiming.preferredTime && (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
              ⏰ 추천 시간대: <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{bestTiming.preferredTime}</span>
            </p>
          )}
        </div>
      )}

      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 4 }}>
        별자리가 가장 밝게 빛나는 날, 도전하세요
      </p>
      {forecasts.map((f, i) => {
        const isLucky = f.status === 'LUCKY';
        const isCaution = f.status === 'CAUTION';
        const barColor = isLucky ? '#22c55e' : isCaution ? '#f87171' : '#06b6d4';
        const dotsFilled = Math.round(f.score / 10);
        return (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 12, background: `${color}08`, border: `1px solid ${color}18` }}>
            <div style={{ minWidth: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color, opacity: 0.7 }}>{f.month}월</p>
              <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} style={{ width: 4, height: 4, borderRadius: 999, background: j < dotsFilled ? barColor : 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, flex: 1 }}>{f.advice}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ── 6. 주의사항 섹션 ─────────────────────────── */

function CautionSection({ cautions, color }: { cautions: string[]; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {cautions.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20` }}>
          <span style={{ fontSize: 16, flexShrink: 0, opacity: 0.7 }}>⚠</span>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{c}</p>
        </div>
      ))}
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

    </>
  );
}
