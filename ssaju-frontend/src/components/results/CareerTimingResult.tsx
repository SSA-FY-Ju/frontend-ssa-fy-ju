'use client';

import { useEffect, useRef, useState } from 'react';
import type { CareerTimingResult as CareerTimingResultType } from '@/types/api';

interface CareerTimingResultProps {
  result: CareerTimingResultType;
}

function getGrade(score: number) {
  if (score >= 80) return { label: '매우 높음', color: '#34d399', hex: '#34d399' };
  if (score >= 60) return { label: '높음',     color: '#fbbf24', hex: '#fbbf24' };
  if (score >= 40) return { label: '보통',     color: '#60a5fa', hex: '#60a5fa' };
  return                  { label: '낮음',     color: '#f87171', hex: '#f87171' };
}

/** H1/H2 → 상반기/하반기 변환 */
function formatFavoredPeriod(period: string): string {
  if (period === 'H1') return '상반기';
  if (period === 'H2') return '하반기';
  return period;
}

/** reasoning 문자열을 문장 단위로 분리 */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.。!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ── 원형 게이지 ─────────────────────────────────── */
function CircularGauge({ score, grade }: { score: number; grade: ReturnType<typeof getGrade> }) {
  const R = 70;
  const circumference = 2 * Math.PI * R;
  const target = circumference * (1 - score / 100);

  // 카운트업 애니메이션
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 1400;

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * score));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* 회전 궤도 링 */}
      <div
        className="absolute inset-0 career-orbit-ring"
        style={{
          borderRadius: '50%',
          border: `1px dashed ${grade.color}33`,
        }}
      />
      {/* 외곽 글로우 링 — 원형 box-shadow 펄스 */}
      <div
        className="absolute career-gauge-glow-ring"
        style={{
          inset: 8,
          borderRadius: '50%',
          border: `1px solid ${grade.color}22`,
          ['--gauge-color-pulse' as string]: `${grade.color}66`,
        }}
      />

      {/* SVG 게이지 */}
      <svg
        width="200" height="200"
        style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
      >
        {/* 배경 트랙 */}
        <circle
          cx="100" cy="100" r={R}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        {/* 게이지 아크 */}
        <circle
          cx="100" cy="100" r={R}
          fill="none"
          stroke={grade.color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="career-gauge-arc"
          style={{
            '--gauge-full': `${circumference}px`,
            '--gauge-target': `${target}px`,
            '--gauge-color': grade.color,
          } as React.CSSProperties}
        />
      </svg>

      {/* 중앙 수치 */}
      <div className="relative flex flex-col items-center justify-center">
        <span
          className="font-black leading-none tabular-nums"
          style={{
            fontSize: 46,
            color: grade.color,
            textShadow: `0 0 20px ${grade.color}88`,
          }}
        >
          {display}
        </span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>/ 100</span>
        <span
          className="mt-2 font-bold"
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            padding: '2px 10px',
            borderRadius: 999,
            background: `${grade.color}18`,
            border: `1px solid ${grade.color}55`,
            color: grade.color,
          }}
        >
          {grade.label}
        </span>
      </div>
    </div>
  );
}

/* ── 플로팅 파티클 ────────────────────────────────── */
function Particles({ color }: { color: string }) {
  const dots = [
    { cls: 'career-float-1', top: '10%', left: '8%',  size: 4 },
    { cls: 'career-float-2', top: '20%', right: '6%', size: 3 },
    { cls: 'career-float-3', top: '70%', left: '5%',  size: 5 },
    { cls: 'career-float-1', top: '80%', right: '8%', size: 3 },
    { cls: 'career-float-2', top: '45%', left: '3%',  size: 4 },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          className={d.cls}
          style={{
            position: 'absolute',
            top: d.top,
            left: 'left' in d ? (d as { left: string }).left : undefined,
            right: 'right' in d ? (d as { right: string }).right : undefined,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────── */
export function CareerTimingResult({ result }: CareerTimingResultProps) {
  const score = Math.max(0, Math.min(100, Math.round(result.confidenceScore)));
  const grade = getGrade(score);
  const sentences = splitSentences(result.reasoning);

  return (
    <div className="relative flex flex-col gap-0 overflow-hidden">
      <Particles color={grade.color} />

      {/* ── 1. 헤더 라벨 ── */}
      <div className="career-fade-up-1 flex items-center gap-3 mb-6">
        <span style={{ fontSize: 10, letterSpacing: '0.22em', color: `${grade.color}99`, fontWeight: 800 }}>✦</span>
        <span style={{ fontSize: 10, letterSpacing: '0.22em', color: grade.color, fontWeight: 800, textTransform: 'uppercase' }}>
          사주 기반 관운 분석
        </span>
        <span style={{ fontSize: 10, letterSpacing: '0.22em', color: `${grade.color}99`, fontWeight: 800 }}>✦</span>
      </div>

      {/* ── 2. 원형 게이지 + 신뢰도 라벨 ── */}
      <div className="career-fade-up-1 flex flex-col items-center gap-3 mb-8">
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          분석 신뢰도
        </p>
        <CircularGauge score={score} grade={grade} />
      </div>

      {/* ── 구분선 ── */}
      <div className="career-line-expand h-px mb-8" style={{ background: `linear-gradient(90deg, ${grade.color}66, ${grade.color}11, transparent)` }} />

      {/* ── 3. 채용 시기 ── */}
      <div className="career-fade-up-2 mb-8">
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
          채용 운이 열리는 시기
        </p>
        <p
          className="career-period-reveal font-black"
          style={{
            fontSize: 'clamp(1.6rem, 6vw, 2.4rem)',
            lineHeight: 1.1,
            color: '#fff',
            letterSpacing: '-0.02em',
            textShadow: `0 0 40px ${grade.color}44, 0 2px 20px rgba(0,0,0,0.5)`,
          }}
        >
          {formatFavoredPeriod(result.favoredPeriod)}
        </p>

        {/* 하이라이트 바 */}
        <div
          className="career-line-expand mt-3 h-0.5 rounded-full"
          style={{ background: `linear-gradient(90deg, ${grade.color}, ${grade.color}22)`, maxWidth: '60%' }}
        />
      </div>

      {/* ── 구분선 ── */}
      <div className="career-line-expand h-px mb-8" style={{ background: `linear-gradient(90deg, rgba(255,255,255,0.06), transparent)` }} />

      {/* ── 4. 분석 근거 (문장 분리 + 순차 애니메이션) ── */}
      <div className="career-fade-up-3">
        <div className="flex items-center gap-2 mb-4">
          <span style={{ width: 3, height: 14, borderRadius: 2, background: grade.color, display: 'inline-block' }} />
          <p style={{ fontSize: 11, color: grade.color, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>
            분석 근거
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {sentences.map((sentence, i) => (
            <div
              key={i}
              style={{
                animation: `careerFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${0.8 + i * 0.15}s both`,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <span style={{ flexShrink: 0, width: 4, height: 4, borderRadius: '50%', background: `${grade.color}88` }} />
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>
                {sentence}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
