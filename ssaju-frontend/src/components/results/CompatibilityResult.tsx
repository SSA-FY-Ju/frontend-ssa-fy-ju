'use client';

/**
 * 기업 궁합 분석 결과 컴포넌트 — 에디토리얼 스타일
 */

import type { CompatibilityResult as CompatibilityResultType } from '@/types/api';
import { CompatibilityScore } from '@/components/visualization/CompatibilityScore';
import { JobMatchingCards } from '@/components/visualization/JobMatchingCards';
import { MonthlyCalendar } from '@/components/visualization/MonthlyCalendar';

interface CompatibilityResultProps {
  result: CompatibilityResultType;
  onReset: () => void;
}

const MILESTONE_STAGES = [
  { key: 'shortTerm' as const, label: '단기', period: '0 — 3개월', numeral: '一', color: '#34d399' },
  { key: 'midTerm'   as const, label: '중기', period: '3 — 12개월', numeral: '二', color: '#22d3ee' },
  { key: 'longTerm'  as const, label: '장기', period: '1 — 3년',    numeral: '三', color: '#c4b5fd' },
];

export function CompatibilityResult({ result, onReset }: CompatibilityResultProps) {
  return (
    <div className="flex flex-col">

      {/* ── 기업명 히어로 ── */}
      <div
        style={{
          textAlign: 'center',
          paddingBottom: 36,
          position: 'relative',
        }}
      >
        {/* 배경 glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            width: 280,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', color: '#a78bfa', opacity: 0.6, textTransform: 'uppercase', marginBottom: 14 }}>
          분석 대상 기업
        </p>
        <h2
          style={{
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.02em',
            textShadow: '0 0 40px rgba(139,92,246,0.4)',
            lineHeight: 1.1,
          }}
        >
          {result.companyName}
        </h2>
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: 'rgba(139,92,246,0.15)', marginBottom: 36 }} />

      {/* ── 종합 점수 ── */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#a78bfa', opacity: 0.6, textTransform: 'uppercase', marginBottom: 20 }}>
          궁합 점수
        </p>
        <CompatibilityScore
          score={result.compatibilityScore}
          confidenceLevel={result.confidenceLevel}
          sipShinScore={result.sipShinScore}
          oHangScore={result.oHangScore}
          jijangGanScore={result.jijangGanScore}
          leadershipScore={result.leadershipScore}
        />
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: 'rgba(139,92,246,0.1)', marginBottom: 36 }} />

      {/* ── 종합 평가 ── */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#a78bfa', opacity: 0.6, textTransform: 'uppercase', marginBottom: 18 }}>
          종합 평가
        </p>
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -8,
              left: 0,
              fontSize: 40,
              lineHeight: 1,
              color: '#a78bfa',
              opacity: 0.18,
              fontFamily: 'serif',
              fontWeight: 900,
            }}
          >
            "
          </span>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, fontStyle: 'italic' }}>
            {result.recommendation}
          </p>
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: 'rgba(139,92,246,0.1)', marginBottom: 36 }} />

      {/* ── 직무별 매칭도 ── */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#a78bfa', opacity: 0.6, textTransform: 'uppercase', marginBottom: 20 }}>
          직무별 매칭도
        </p>
        <JobMatchingCards cards={result.jobMatchCards} />
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: 'rgba(139,92,246,0.1)', marginBottom: 36 }} />

      {/* ── 경력 발전 로드맵 — 타임라인 ── */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#a78bfa', opacity: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>
          경력 발전 로드맵
        </p>
        <div className="flex flex-col">
          {MILESTONE_STAGES.map((stage, i) => (
            <div key={stage.key}>
              <div style={{ display: 'flex', gap: 24, padding: '24px 0' }}>
                {/* 좌측 — 한자 + 라벨 + 기간 */}
                <div style={{ flexShrink: 0, width: 60, textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: 32, fontWeight: 900, fontFamily: 'serif', color: stage.color, opacity: 0.5, lineHeight: 1, marginBottom: 5 }}>
                    {stage.numeral}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: stage.color, letterSpacing: '0.05em' }}>
                    {stage.label}
                  </span>
                  <span style={{ display: 'block', fontSize: 10, color: stage.color, opacity: 0.45, marginTop: 2 }}>
                    {stage.period}
                  </span>
                </div>
                {/* 세로 구분선 + 점 */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 1, height: '100%', background: `linear-gradient(180deg, ${stage.color}55, ${stage.color}11)` }} />
                  <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: stage.color, boxShadow: `0 0 8px ${stage.color}` }} />
                </div>
                {/* 본문 */}
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>
                    {result.careerMilestone[stage.key]}
                  </p>
                </div>
              </div>
              {i < MILESTONE_STAGES.length - 1 && (
                <div style={{ height: 1, background: 'rgba(6,182,212,0.08)', margin: '0 0 0 84px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: 'rgba(139,92,246,0.1)', marginBottom: 36 }} />

      {/* ── 월별 운세 ── */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#a78bfa', opacity: 0.6, textTransform: 'uppercase', marginBottom: 20 }}>
          월별 운세
        </p>
        <MonthlyCalendar forecasts={result.monthlyForecasts} />
      </div>

      {/* 새 분석 */}
      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 10,
          border: '1px solid rgba(139,92,246,0.2)',
          background: 'transparent',
          color: 'rgba(196,181,253,0.5)',
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
          e.currentTarget.style.color = '#c4b5fd';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
          e.currentTarget.style.color = 'rgba(196,181,253,0.5)';
        }}
      >
        새 분석 시작하기
      </button>
    </div>
  );
}
